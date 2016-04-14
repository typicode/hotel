const util = require('util')
const once = require('once')
const express = require('express')
const serverReady = require('server-ready')
const errorMsg = require('../views/error-msg')
const proxyPac = require('../views/proxy-pac')

module.exports = function (servers) {
  let router = express.Router()

  function pac (req, res) {
    util.log('Serve proxy.pac')
    res.send(proxyPac)
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

    // When redirecting keep hostname (i.e. localhost or 127.0.0.1)
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

  return router
}
