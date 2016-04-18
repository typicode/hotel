const util = require('util')
const once = require('once')
const express = require('express')
const httpProxy = require('http-proxy')
const serverReady = require('server-ready')
const getServerId = require('./utils/get-server-id')
const errorMsg = require('../views/error-msg')
const conf = require('../../conf')

// *.tld vhost
module.exports = (servers) => {
  const app = express.Router()
  const proxy = httpProxy.createProxyServer()
  const hotelRegExp = new RegExp(`hotel\.${conf.tld}$`)
  const tldRegExp = new RegExp(`.${conf.tld}$`)

  app.use((req, res, next) => {
    const { hostname } = req

    // Skip hotel.tld
    if (hotelRegExp.test(hostname)) {
      return next()
    }

    // Get id from hostname
    const id = getServerId(
      servers.list().map(s => s.id),
      hostname.replace(tldRegExp, '')
    )

    if (!servers.has(id)) {
      const msg = `Can't find server for http://${hostname}`
      util.log(msg)
      return res.status(404).send(msg)
    }

    // Start server
    const server = servers.start(id)

    // Target
    const { PORT } = server.env
    const target = `http://localhost:${PORT}`

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
