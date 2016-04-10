const express = require('express')
const connectSSE = require('connect-sse')
const ansiUp = require('ansi_up')
const sse = connectSSE()

module.exports = (servers) => {
  const router = express.Router()

  router.get('/', sse, (req, res) => {
    function sendState () {
      res.json({ monitors: servers.list() })
    }

    servers.on('change', sendState)
    sendState()
  })

  router.get('/output/:id', sse, (req, res) => {
    const { id } = req.params
    const mon = servers.get(id)
    if (!mon) return res.sendStatus(404)

    function sendOutput (data) {
      res.json({
        output: ansiUp.ansi_to_html(data.toString())
      })
    }

    mon.on('stdout', sendOutput)
    mon.on('stderr', sendOutput)
    sendOutput('')
  })

  return router
}
