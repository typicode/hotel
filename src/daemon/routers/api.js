const express = require('express')

module.exports = (servers) => {
  const router = express.Router()

  const exists = (req, res, next) => {
    if (servers.has(req.params.id)) return next()
    res.sendStatus(404)
  }

  router.post('/start', exists, (req, res) => {
    servers.start(req.params.id)
    res.end()
  })

  router.post('/stop', exists, (req, res) => {
    servers.stop(req.params.id)
    res.end()
  })

  return router
}
