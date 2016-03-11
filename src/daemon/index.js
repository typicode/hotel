const fs = require('fs')
const path = require('path')
const httpProxy = require('http-proxy')
const util = require('util')
const conf = require('../conf')
const pidFile = require('../pid-file')
const servers = require('./server-group')()
const server = require('./app')(servers)

pidFile.create()
process.on('exit', pidFile.remove)

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
