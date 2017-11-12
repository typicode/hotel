const express = require('express')
const connectSSE = require('connect-sse')
const sse = connectSSE()

module.exports = group => {
  const router = express.Router()

  function listen(res, event, handler) {
    group.on(event, handler)

    function removeListener() {
      group.removeListener(event, handler)

      res.removeListener('close', removeListener)
      res.removeListener('finish', removeListener)
    }

    res.on('close', removeListener)
    res.on('finish', removeListener)
  }

  router.get('/', sse, (req, res) => {
    function sendState() {
      res.json(group.list())
    }

    // Bootstrap
    sendState()

    // Listen
    listen(res, 'change', sendState)
  })

  router.get('/output', sse, (req, res) => {
    function sendOutput(id, output) {
      if (!Array.isArray(output)) output = [output]
      res.json({
        id,
        output
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
    listen(res, 'output', sendOutput)
  })

  return router
}
