const express = require('express')
const connectSSE = require('connect-sse')
const sse = connectSSE()

function listen(res, group, groupEvent, handler) {
  function removeListener() {
    // Remove group handler
    group.removeListener(groupEvent, handler)

    // Remove self
    res.removeListener('close', removeListener)
    res.removeListener('finish', removeListener)
  }

  group.on(groupEvent, handler)

  res.on('close', removeListener)
  res.on('finish', removeListener)
}

function sendState(res, group) {
  res.json(group.list())
}

function sendOutput(res, id, data) {
  res.json({
    id,
    output: data.toString()
  })
}

module.exports = group => {
  const router = express.Router()

  router.get('/', sse, (req, res) => {
    // Bootstrap
    sendState(res, group)

    // Listen
    listen(res, group, 'change', sendState)
  })

  router.get('/output', sse, (req, res) => {
    // Bootstrap
    const list = group.list()
    Object.keys(list).forEach(id => {
      var mon = list[id]
      if (mon && mon.tail) {
        sendOutput(res, id, mon.tail)
      }
    })

    // Listen
    listen(res, group, 'output', sendOutput)
  })

  return router
}
