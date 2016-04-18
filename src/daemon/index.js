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

const proxy = httpProxy.createServer({
  target: {
    host: '127.0.0.1',
    port: conf.port
  },
  ssl: {
    key: fs.readFileSync(path.join(__dirname, 'certs/server.key')),
    cert: fs.readFileSync(path.join(__dirname, 'certs/server.crt'))
  },
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
