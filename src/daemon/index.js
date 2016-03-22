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
  console.log('Remove pid file')
  pidFile.remove()
  process.exit()
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

proxy.listen(conf.port + 1)

server.listen(conf.port, conf.host, function () {
  util.log(`Server listening on port ${conf.host}:${conf.port}`)
})
