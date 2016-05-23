const fs = require('fs')
const path = require('path')
const util = require('util')
const exitHook = require('exit-hook')
const httpProxy = require('http-proxy')
const conf = require('../conf')
const pidFile = require('../pid-file')
const servers = require('./server-group')()
const server = require('./app')(servers)

pidFile.create()
exitHook(() => {
  console.log('Exiting')
  console.log('Stop daemon')
  proxy.close()
  server.close()
  console.log('Remove pid file')
  pidFile.remove()
})

const ssl = {}
const {
  HOME,
  HOMEPATH,
  USERPROFILE
} = process.env
const home_path = HOME || HOMEPATH || USERPROFILE

if (conf.key_path && conf.cert_path) {
  ssl.key = fs.readFileSync(path.resolve(home_path, conf.key_path))
  ssl.cert = fs.readFileSync(path.resolve(home_path, conf.cert_path))
} else {
  ssl.key = fs.readFileSync(path.join(__dirname, 'certs/server.key'))
  ssl.cert = fs.readFileSync(path.join(__dirname, 'certs/server.crt'))
}

const proxy = httpProxy.createServer({
  target: {
    host: '127.0.0.1',
    port: conf.port
  },
  ssl,
  ws: true
})

// See https://github.com/typicode/hotel/pull/61
proxy.on('proxyReq', (proxyReq, req) => {
  req._proxyReq = proxyReq
})

proxy.on('error', (err, req) => {
  if (req.socket.destroyed && err.code === 'ECONNRESET') {
    req._proxyReq.abort()
  }
})

proxy.listen(conf.port + 1)

server.listen(conf.port, conf.host, function () {
  util.log(`Server listening on port ${conf.host}:${conf.port}`)
})
