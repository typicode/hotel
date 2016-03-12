const util = require('util')
const once = require('once')
const express = require('express')
const httpProxy = require('http-proxy')
const serverReady = require('server-ready')
const errorMsg = require('../views/error-msg')
const conf = require('../../conf')

// *.dev vhost
module.exports = (servers) => {
  const app = express.Router()
  const proxy = httpProxy.createProxyServer()

  app.use((req, res, next) => {
    const { hostname } = req
    const regexp = new RegExp(`.${conf.tld}$`)
    const id = hostname.replace(regexp, '').replace(/(\w+\.)*/, '')

    if (!servers.has(id)) {
      const msg = `Can't find server for http://${hostname}`
      util.log(msg)
      return res.status(404).send(msg)
    }

    // Start server
    const server = servers.start(id)

    // Target
    const { PORT } = server.env
    const target = `http://127.0.0.1:${PORT}`

    // Make sure to send only one response
    const forward = once(err => {
      if (err) {
        const msg = errorMsg(server)
        res.status(502).send(msg)
      } else {
        util.log(`Proxy http://${hostname} to ${target}`)
        proxy.web(req, res, { target }, (err, req, res) => {
          if (err) {
            const msg = errorMsg(server)
            res.status(502).send(msg)
          }
        })
      }
    })

    // If server stops, no need to wait for timeout
    server.once('stop', () => forward(new Error('Server stopped')))

    // When PORT is open, proxy
    serverReady(PORT, forward)
  })

  return app
}
