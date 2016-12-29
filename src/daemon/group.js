const os = require('os')
const fs = require('fs')
const path = require('path')
const util = require('util')
const EventEmitter = require('events')
const url = require('url')
const once = require('once')
const getPort = require('get-port')
const matcher = require('matcher')
const unquote = require('unquote')
const respawn = require('respawn')
const afterAll = require('after-all')
const httpProxy = require('http-proxy')
const serverReady = require('server-ready')
const arrayFind = require('array-find')
const errorMsg = require('./views/error-msg')
const tcpProxy = require('./tcp-proxy')
const daemonConf = require('../conf')

module.exports = () => new Group()

class Group extends EventEmitter {
  constructor () {
    super()

    this._list = {}
    this._proxy = httpProxy.createProxyServer({ xfwd: true })
    this._proxy.on('error', this.handleProxyError)
  }

  _output (id, data) {
    this.emit('output', id, data)
  }

  _log (mon, logFile, data) {
    mon.tail = mon.tail
      .concat(data)
      .split('\n')
      .slice(-100)
      .join('\n')

    if (logFile) {
      fs.appendFile(logFile, data, (err) => {
        if (err) util.log(err.message)
      })
    }
  }

  _change () {
    this.emit('change', this._list)
  }

  //
  // Conf
  //

  list () {
    return this._list
  }

  find (id) {
    return this._list[id]
  }

  add (id, conf) {
    if (conf.target) {
      util.log(`Add target ${id}`)
      this._list[id] = conf
      this._change()
      return
    }

    util.log(`Add server ${id}`)

    const HTTP_PROXY = `http://127.0.0.1:${daemonConf.port}/proxy.pac`

    conf.env = {
      ...process.env,
      ...conf.env
    }

    if (daemonConf.http_proxy) {
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

    let command = (os.platform() === 'win32')
      ? ['cmd', '/c'].concat(conf.cmd.split(' '))
      : ['sh', '-c'].concat(unquote(conf.cmd))

    const mon = respawn(command, {
      ...conf,
      maxRestarts: 0
    })

    this._list[id] = mon

    // Emit output
    mon.on('stdout', (data) => this._output(id, data))
    mon.on('stderr', (data) => this._output(id, data))
    mon.on('warn', (data) => this._output(id, data))

    // Emit change
    mon.on('start', () => this._change())
    mon.on('stop', () => this._change())
    mon.on('crash', () => this._change())
    mon.on('sleep', () => this._change())
    mon.on('exit', () => this._change())

    // Log status
    mon.on('start', () => util.log(id, 'has started'))
    mon.on('stop', () => util.log(id, 'has stopped'))
    mon.on('crash', () => util.log(id, 'has crashed'))
    mon.on('sleep', () => util.log(id, 'is sleeping'))
    mon.on('exit', () => util.log(id, 'child process has exited'))

    // Handle logs
    mon.tail = ''

    mon.on('stdout', (data) => this._log(mon, logFile, data))
    mon.on('stderr', (data) => this._log(mon, logFile, data))
    mon.on('warn', (data) => this._log(mon, logFile, data))

    mon.on('start', () => {
      mon.tail = ''

      if (logFile) {
        fs.unlink(logFile, (err) => {
          if (err) util.log(err.message)
        })
      }
    })

    this._change()
  }

  remove (id, cb) {
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

  stopAll (cb) {
    const next = afterAll(cb)

    Object
      .keys(this._list)
      .forEach((key) => {
        if (this._list[key].stop) {
          this._list[key].stop(next())
        }
      })
  }

  update (id, conf) {
    this.remove(id, () => this.add(id, conf))
  }

  //
  // Hostname resolver
  //

  resolve (str) {
    util.log(`Resolve ${str}`)
    const arr = Object.keys(this._list)
      .sort()
      .reverse()
      .map(h => ({
        host: h,
        isStrictMatch: matcher.isMatch(str, h),
        isWildcardMatch: matcher.isMatch(str, `*.${h}`)
      }))

    const strictMatch = arrayFind(arr, h => h.isStrictMatch)
    const wildcardMatch = arrayFind(arr, h => h.isWildcardMatch)

    if (strictMatch) return strictMatch.host
    if (wildcardMatch) return wildcardMatch.host
  }

  //
  // Middlewares
  //

  handleProxyError (_, req, res) {
    util.log('Proxy error')
    const msg = errorMsg(req.hotel.item)
    res.status(502).send(msg)
  }

  exists (req, res, next) {
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
      util.log(msg)
      return res.status(404).send(msg)
    }

    req.hotel = {
      id,
      item
    }

    next()
  }

  start (req, res, next) {
    const { item } = req.hotel

    if (item.start) {
      if (item.env.PORT) {
        item.start()
        next()
      } else {
        getPort()
          .then((port) => {
            item.env.PORT = port
            item.start()
            next()
          })
          .catch((error) => {
            next(error)
          })
      }
    } else {
      next()
    }
  }

  stop (req, res, next) {
    const { item } = req.hotel

    if (item.stop) {
      item.stop()
    }

    next()
  }

  proxy (req, res) {
    const [ hostname, port ] = req.headers.host && req.headers.host.split(':')
    const { item } = req.hotel

    // Handle case where port is set
    // http://app.dev:5000 should proxy to http://localhost:5000
    if (port) {
      const target = `http://127.0.0.1:${port}`
      util.log(`Proxy http://${req.headers.host} to ${target}`)
      return this._proxy.web(req, res, { target })
    }

    // Make sure to send only one response
    const send = once(() => {
      util.log(`Proxy http://${hostname} to ${item.target}`)
      this._proxy.web(req, res, { target: item.target })
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

  redirect (req, res) {
    const { id } = req.params
    const { item } = req.hotel

    // Make sure to send only one response
    const send = once(() => {
      util.log(`Redirect ${id} to ${item.target}`)
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

  parseReq (req) {
    if (req.headers.host) {
      const [hostname, port] = req.headers.host.split(':')
      const regexp = new RegExp(`.${daemonConf.tld}$`)
      const id = hostname.replace(regexp, '')
      return { id, port }
    } else {
      util.log('No host header found')
      return {}
    }
  }

  // Needed to proxy WebSocket from CONNECT
  handleUpgrade (req, socket, head) {
    if (req.headers.host) {
      const [hostname, port] = req.headers.host.split(':')
      const tld = new RegExp(`.${daemonConf.tld}$`)
      const id = this.resolve(hostname.replace(tld, ''))
      const item = this.find(id)

      if (item) {
        let target
        if (port !== '80') {
          target = `ws://127.0.0.1:${port}`
        } else if (item.start) {
          target = `ws://127.0.0.1:${item.env.PORT}`
        } else {
          const { hostname } = url.parse(item.target)
          target = `ws://${hostname}`
        }
        util.log(`WebSocket - proxy WebSocket to ${target}`)
        this._proxy.ws(req, socket, head, { target })
      } else {
        util.log(`WebSocket - No server matching ${id}`)
      }
    } else {
      util.log('WebSocket - No host header found')
    }
  }

  // Handle CONNECT, used by WebSockets and https when accessing .dev domains
  handleConnect (req, socket, head) {
    if (req.headers.host) {
      const [hostname, port] = req.headers.host.split(':')

      // If https make socket go through https proxy on 2001
      // TODO find a way to detect https and wss without relying on port number
      if (port === '443') {
        return tcpProxy.proxy(socket, daemonConf.port + 1, hostname)
      }

      const tld = new RegExp(`.${daemonConf.tld}$`)
      const id = this.resolve(hostname.replace(tld, ''))
      const item = this.find(id)

      if (item) {
        if (port !== '80') {
          util.log(`Connect - proxy socket to ${port}`)
          tcpProxy.proxy(socket, port)
        } else if (item.start) {
          const { PORT } = item.env
          util.log(`Connect - proxy socket to ${PORT}`)
          tcpProxy.proxy(socket, PORT)
        } else {
          const { hostname, port } = url.parse(item.target)
          util.log(`Connect - proxy socket to ${hostname}:${port}`)
          tcpProxy.proxy(socket, port || 80, hostname)
        }
      } else {
        util.log(`Connect - Can't find server for ${id}`)
        socket.end()
      }
    } else {
      util.log('Connect - No host header found')
    }
  }
}
