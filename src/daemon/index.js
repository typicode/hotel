const util = require('util')
const http = require('http')
const express = require('express')
const vhost = require('vhost')
const socketIO = require('socket.io')
const conf = require('../conf')

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

// Start server
server.listen(conf.port, conf.host, function () {
  util.log(`Server listening on port ${conf.host}:${conf.port}`)
})
