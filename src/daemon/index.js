const util = require('util')
const express = require('express')
const conf = require('../conf')

const app = require('express')()
const server = require('http').Server(app)
const io = require('socket.io')(server)

const servers = require('./server-group')()
const router = require('./router')(servers)

// Add ./public
app.use(express.static(`${__dirname}/public`))
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
