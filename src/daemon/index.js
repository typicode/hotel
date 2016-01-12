const util = require('util')
const http = require('http')
const express = require('express')
const vhost = require('vhost')
const conf = require('../conf')
const tcpProxy = require('./tcp-proxy')

const app = express()
const server = http.createServer(app)

const servers = require('./server-group')()
const indexRouter = require('./routers')(servers)
const api = require('./routers/api')(servers)
const events = require('./events')(servers)
const hotelHost = require('./vhosts/hotel-dev')(servers)
const devHost = require('./vhosts/dev')(servers)

// requests timeout
const serverReady = require('server-ready')
serverReady.timeout = conf.timeout

// Server-sent events for servers
app.use('/_events', events)

// API
app.use('/_servers', api)

// .dev hosts
app.use(vhost('hotel.dev', hotelHost))
app.use(vhost('*.dev', devHost))

// public
app.use(express.static(`${__dirname}/public`))

// Server router
app.use(indexRouter)

// Handle CONNECT, used by WebSockets when accessing .dev domains
server.on('connect', (req, socket, head) => {
  const hostname = req.headers.host.split(':')[0]
  const id = hostname.replace(/.dev$/, '')
  if (hostname === 'hotel.dev') {
    util.log(`Proxy socket to ${conf.port}`)
    tcpProxy(socket, conf.port)
  } else if (servers.has(id)) {
    // Start server
    const server = servers.start(id)

    // Target
    const { PORT } = server.env

    util.log(`Proxy socket to ${PORT}`)
    tcpProxy(socket, PORT)
  } else {
    util.log(`Can't find server for http://${hostname}`)
    socket.end()
  }
})

// Start server
server.listen(conf.port, conf.host, function () {
  util.log(`Server listening on port ${conf.host}:${conf.port}`)
})
