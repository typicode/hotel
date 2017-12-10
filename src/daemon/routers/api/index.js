const express = require('express')

const ServerRouter = require('./servers')
const EventRouter = require('./events')
const ConfRouter = require('./conf')

module.exports = group => {
  const router = express.Router()

  const servers = ServerRouter(group)
  const events = EventRouter(group)
  const conf = ConfRouter(group)

  router.use('/servers', servers)
  router.use('/conf', conf)
  router.use('/events', events)

  return router
}
