const express = require('express')
const connectSSE = require('connect-sse')
const sse = connectSSE()

module.exports = group => {
  const router = express.Router()

  router.get('/', sse, (req, res) => {
    function sendState() {
      res.json(group.list())
    }

    // Bootstrap
    sendState()

    // Listen
    group.on('change', sendState)
  })

  router.get('/output', sse, (req, res) => {
    function sendOutput(id, data) {
      res.json({
        id,
        output: data.toString()
      })
    }

    // Bootstrap
    const list = group.list()
    Object.keys(list).forEach(id => {
      var mon = list[id]
      if (mon && mon.tail) {
        sendOutput(id, mon.tail)
      }
    })

    // Listen
    group.on('output', sendOutput)
  })

  return router
}
