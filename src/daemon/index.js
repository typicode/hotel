const fs = require('fs')
const path = require('path')
const util = require('util')
const exitHook = require('exit-hook')
const httpProxy = require('http-proxy')
const conf = require('../conf')
const pidFile = require('../pid-file')
const Group = require('./group')
const Loader = require('./loader')
const App = require('./app')

const group = Group()
const app = App(group)

// Load and watch files
Loader(group)

// Create pid file
pidFile.create()

// Clean exit
exitHook(() => {
  console.log('Exiting')
  console.log('Stop daemon')
  proxy.close()
  app.close()

  console.log('Remove pid file')
  pidFile.remove()
})

// HTTPS proxy
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

// Start HTTPS proxy and HTTP server
proxy.listen(conf.port + 1)

app.listen(conf.port, conf.host, function () {
  util.log(`Server listening on port ${conf.host}:${conf.port}`)
})
