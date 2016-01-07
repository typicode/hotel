const util = require('util')
const http = require('http')
const express = require('express')
const vhost = require('vhost')
const socketIO = require('socket.io')
const conf = require('../conf')
const tcpProxy = require('./tcp-proxy')

const app = express()
const server = http.createServer(app)
const io = socketIO(server)

const servers = require('./server-group')()
const router = require('./router')(servers)
const hotelHost = require('./vhosts/hotel-dev')(servers)
const devHost = require('./vhosts/dev')(servers)

// requests timeout
const serverReady = require('server-ready')
serverReady.timeout = conf.timeout

// .dev hosts
app.use(vhost('hotel.dev', hotelHost))
app.use(vhost('*.dev', devHost))

// public
app.use(express.static(`${__dirname}/public`))

// servers router
app.use(router)

// Socket.io real-time updates
io.on('connection', function (socket) {
  util.log('Socket.io connection')

  function emitChange () {
    socket.emit('change', { monitors: servers.list() })
  }

  servers.on('change', emitChange)
  emitChange()

  socket.on('stop', id => servers.stop(id))
  socket.on('start', id => servers.start(id))
})

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
