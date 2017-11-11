const express = require('express')

module.exports = group => {
  const router = express.Router()

  router.get('/', (req, res) => {
    res.json(group.list())
  })

  router.post(
    '/:id/start',
    group.exists.bind(group),
    group.start.bind(group),
    (req, res) => res.end()
  )

  router.post(
    '/:id/stop',
    group.exists.bind(group),
    group.stop.bind(group),
    (req, res) => res.end()
  )

  return router
}
