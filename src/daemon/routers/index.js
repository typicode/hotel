const util = require('util')
const once = require('once')
const express = require('express')
const serverReady = require('server-ready')
const errorMsg = require('../views/error-msg')
const proxyPac = require('../views/proxy-pac')

module.exports = function (servers) {
  let router = express.Router()

  function pac (req, res) {
    res.send(proxyPac)
  }

  function kill (req, res) {
    res.end()
    util.log('Shutting down servers')
    servers.shutdown(() => {
      util.log('Exit')
      process.exit()
    })
  }

  function redirect (req, res, next) {
    const { id } = req.params

    if (!servers.has(id)) {
      const msg = `Redirect - can't find server for ${id}`
      util.log(msg)
      return res.redirect('/')
    }

    // Start server
    const server = servers.start(id)

    // Target
    const { PORT } = server.env
    const { hostname } = req
    const target = `http://${hostname}:${PORT}`

    // Make sure to send only one response
    const forward = once((err) => {
      if (err) {
        const msg = errorMsg(servers.get(id))
        res.status(502).send(msg)
      } else {
        util.log(`Redirect to ${target}`)
        res.redirect(target)
      }
    })

    // If server stops, no need to wait for timeout
    server.once('stop', () => forward(new Error('Server stopped')))

    // When PORT is open, forward
    serverReady(PORT, forward)
  }

  router
    .get('/proxy.pac', pac)
    .get('/:id', redirect)
    .post('/kill', kill)

  return router
}
