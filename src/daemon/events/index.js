const express = require('express')
const connectSSE = require('connect-sse')
const sse = connectSSE()

module.exports = (servers) => {
  const router = express.Router()

  router.get('/', sse, (req, res) => {
    function sendState () {
      res.json({ state: servers.list() }, 'servers')
    }

    servers.on('change', sendState)
    sendState()
  })

  return router
}
