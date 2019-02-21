const fs = require('fs')
const path = require('path')
const EventEmitter = require('events')
const url = require('url')
const once = require('once')
const getPort = require('get-port')
const matcher = require('matcher')
const respawn = require('respawn')
const afterAll = require('after-all')
const httpProxy = require('http-proxy')
const serverReady = require('server-ready')
const log = require('./log')
const tcpProxy = require('./tcp-proxy')
const daemonConf = require('../conf')
const getCmd = require('../get-cmd')

module.exports = () => new Group()

class Group extends EventEmitter {
  constructor() {
    super()

    this._list = {}
    this._proxy = httpProxy.createProxyServer({
      xfwd: true
    })
  }

  _output(id, data) {
    this.emit('output', id, data)
  }

  _log(mon, logFile, data) {
    mon.tail = mon.tail
      .concat(data)
      .split('\n')
      .slice(-100)
      .join('\n')

    if (logFile) {
      fs.appendFile(logFile, data, err => {
        if (err) log(err.message)
      })
    }
  }

  _change() {
    this.emit('change', this._list)
  }

  //
  // Conf
  //

  list() {
    return this._list
  }

  find(id) {
    return this._list[id]
  }

  add(id, conf) {
    if (conf.target) {
      log(`Add target ${id}`)
      this._list[id] = conf
      this._change()
      return
    }

    log(`Add server ${id}`)

    const HTTP_PROXY = `http://127.0.0.1:${daemonConf.port}/proxy.pac`

    conf.env = {
      ...process.env,
      ...conf.env
    }

    if (conf.httpProxyEnv) {
      conf.env = {
        HTTP_PROXY,
        HTTPS_PROXY: HTTP_PROXY,
        http_proxy: HTTP_PROXY,
        https_proxy: HTTP_PROXY,
        ...conf.env
      }
    }

    let logFile
    if (conf.out) {
      logFile = path.resolve(conf.cwd, conf.out)
    }

    const command = getCmd(conf.cmd)

    const mon = respawn(command, {
      ...conf,
      maxRestarts: 0
    })

    this._list[id] = mon

    // Add proxy config
    mon.xfwd = conf.xfwd || false
    mon.changeOrigin = conf.changeOrigin || false

    // Emit output
    mon.on('stdout', data => this._output(id, data))
    mon.on('stderr', data => this._output(id, data))
    mon.on('warn', data => this._output(id, data))

    // Emit change
    mon.on('start', () => this._change())
    mon.on('stop', () => this._change())
    mon.on('crash', () => this._change())
    mon.on('sleep', () => this._change())
    mon.on('exit', () => this._change())

    // Log status
    mon.on('start', () => log(id, 'has started'))
    mon.on('stop', () => log(id, 'has stopped'))
    mon.on('crash', () => log(id, 'has crashed'))
    mon.on('sleep', () => log(id, 'is sleeping'))
    mon.on('exit', () => log(id, 'child process has exited'))

    // Handle logs
    mon.tail = ''

    mon.on('stdout', data => this._log(mon, logFile, data))
    mon.on('stderr', data => this._log(mon, logFile, data))
    mon.on('warn', data => this._log(mon, logFile, data))

    mon.on('start', () => {
      mon.tail = ''

      if (logFile) {
        fs.unlink(logFile, err => {
          if (err) log(err.message)
        })
      }
    })

    this._change()
  }

  remove(id, cb) {
    const item = this.find(id)
    if (item) {
      delete this._list[id]
      this._change()

      if (item.stop) {
        item.stop(cb)
        item.removeAllListeners()
        return
      }
    }

    cb && cb()
  }

  stopAll(cb) {
    const next = afterAll(cb)

    Object.keys(this._list).forEach(key => {
      if (this._list[key].stop) {
        this._list[key].stop(next())
      }
    })
  }

  update(id, conf) {
    this.remove(id, () => this.add(id, conf))
  }

  //
  // Hostname resolver
  //

  resolve(str) {
    log(`Resolve ${str}`)
    const arr = Object.keys(this._list)
      .sort()
      .reverse()
      .map(h => ({
        host: h,
        isStrictMatch: matcher.isMatch(str, h),
        isWildcardMatch: matcher.isMatch(str, `*.${h}`)
      }))

    const strictMatch = arr.find(h => h.isStrictMatch)
    const wildcardMatch = arr.find(h => h.isWildcardMatch)

    if (strictMatch) return strictMatch.host
    if (wildcardMatch) return wildcardMatch.host
  }

  //
  // Middlewares
  //

  exists(req, res, next) {
    // Resolve using either hostname `app.tld`
    // or id param `http://localhost:2000/app`
    const tld = new RegExp(`.${daemonConf.tld}$`)
    const id = req.params.id
      ? this.resolve(req.params.id)
      : this.resolve(req.hostname.replace(tld, ''))

    // Find item
    const item = this.find(id)

    // Not found
    if (!id || !item) {
      const msg = `Can't find server id: ${id}`
      log(msg)
      return res.status(404).send(msg)
    }

    req.hotel = {
      id,
      item
    }

    next()
  }

  start(req, res, next) {
    const { item } = req.hotel

    if (item.start) {
      if (item.env.PORT) {
        item.start()
        next()
      } else {
        getPort()
          .then(port => {
            item.env.PORT = port
            item.start()
            next()
          })
          .catch(error => {
            next(error)
          })
      }
    } else {
      next()
    }
  }

  stop(req, res, next) {
    const { item } = req.hotel

    if (item.stop) {
      item.stop()
    }

    next()
  }

  proxyWeb(req, res, target) {
    const { xfwd, changeOrigin } = req.hotel.item

    this._proxy.web(
      req,
      res,
      {
        target,
        xfwd,
        changeOrigin
      },
      err => {
        log('Proxy - Error', err.message)
        const server = req.hotel.item
        const view = server.start ? 'server-error' : 'target-error'
        res.status(502).render(view, {
          err,
          serverReady,
          server
        })
      }
    )
  }

  proxy(req, res) {
    const [hostname, port] = req.headers.host && req.headers.host.split(':')
    const { item } = req.hotel

    // Handle case where port is set
    // http://app.localhost:5000 should proxy to http://localhost:5000
    if (port) {
      const target = `http://127.0.0.1:${port}`

      log(`Proxy - http://${req.headers.host} → ${target}`)
      return this.proxyWeb(req, res, target)
    }

    // Make sure to send only one response
    const send = once(() => {
      const { target } = item

      log(`Proxy - http://${hostname} → ${target}`)
      this.proxyWeb(req, res, target)
    })

    if (item.start) {
      // Set target
      item.target = `http://localhost:${item.env.PORT}`

      // If server stops, no need to wait for timeout
      item.once('stop', send)

      // When PORT is open, proxy
      serverReady(item.env.PORT, send)
    } else {
      // Send immediatly if item is not a server started by a command
      send()
    }
  }

  redirect(req, res) {
    const { id } = req.params
    const { item } = req.hotel

    // Make sure to send only one response
    const send = once(() => {
      log(`Redirect - ${id} → ${item.target}`)
      res.redirect(item.target)
    })

    if (item.start) {
      // Set target
      item.target = `http://${req.hostname}:${item.env.PORT}`

      // If server stops, no need to wait for timeout
      item.once('stop', send)

      // When PORT is open, redirect
      serverReady(item.env.PORT, send)
    } else {
      // Send immediatly if item is not a server started by a command
      send()
    }
  }

  parseHost(host) {
    const [hostname, port] = host.split(':')
    const tld = new RegExp(`.${daemonConf.tld}$`)
    const id = this.resolve(hostname.replace(tld, ''))
    return { id, hostname, port }
  }

  // Needed to proxy WebSocket from CONNECT
  handleUpgrade(req, socket, head) {
    if (req.headers.host) {
      const { host } = req.headers
      const { id, port } = this.parseHost(host)
      const item = this.find(id)

      if (item) {
        let target
        if (port && port !== '80') {
          target = `ws://127.0.0.1:${port}`
        } else if (item.start) {
          target = `ws://127.0.0.1:${item.env.PORT}`
        } else {
          const { hostname } = url.parse(item.target)
          target = `ws://${hostname}`
        }
        log(`WebSocket - ${host} → ${target}`)
        this._proxy.ws(req, socket, head, { target }, err => {
          log('WebSocket - Error', err.message)
        })
      } else {
        log(`WebSocket - No server matching ${id}`)
      }
    } else {
      log('WebSocket - No host header found')
    }
  }

  // Handle CONNECT, used by WebSockets and https when accessing .localhost domains
  handleConnect(req, socket, head) {
    if (req.headers.host) {
      const { host } = req.headers
      const { id, hostname, port } = this.parseHost(host)

      // If https make socket go through https proxy on 2001
      // TODO find a way to detect https and wss without relying on port number
      if (port === '443') {
        return tcpProxy.proxy(socket, daemonConf.sslPort, hostname)
      }

      const item = this.find(id)

      if (item) {
        if (port && port !== '80') {
          log(`Connect - ${host} → ${port}`)
          tcpProxy.proxy(socket, port)
        } else if (item.start) {
          const { PORT } = item.env
          log(`Connect - ${host} → ${PORT}`)
          tcpProxy.proxy(socket, PORT)
        } else {
          const { hostname, port } = url.parse(item.target)
          const targetPort = port || 80
          log(`Connect - ${host} → ${hostname}:${port}`)
          tcpProxy.proxy(socket, targetPort, hostname)
        }
      } else {
        log(`Connect - Can't find server for ${id}`)
        socket.end()
      }
    } else {
      log('Connect - No host header found')
    }
  }
}
