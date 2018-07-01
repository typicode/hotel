const express = require('express')

const ServerRouter = require('./servers')
const EventRouter = require('./events')

module.exports = group => {
  const router = express.Router()

  const servers = ServerRouter(group)
  const events = EventRouter(group)

  router.use('/servers', servers)
  router.use('/events', events)

  return router
}
