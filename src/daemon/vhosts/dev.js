const util = require('util')
const once = require('once')
const express = require('express')
const httpProxy = require('http-proxy')
const serverReady = require('server-ready')
const errorMsg = require('../views/error-msg')
const conf = require('../../conf')

// find out if an id is a child of a wildcard id/domain
const find_wildcard_id = function (id, group) {
  var idx, srv
  while ((idx = id.indexOf('.')) !== -1) {
    id = id.slice(idx + 1)
    srv = group.get(id)
    if (srv && srv.env.HOTEL_WILDCARD) {
      return id
    }
  }
  return null
}

// find if we can serve this request
const find_server = function (hostname, group) {
  const regexp = new RegExp(`.${conf.tld}$`)
  const id = hostname.replace(regexp, '')
  if (group.has(id)) {
    return id
  }
  return find_wildcard_id(id, group)
}

// *.dev vhost
module.exports = (servers) => {
  const app = express.Router()
  const proxy = httpProxy.createProxyServer()

  app.use((req, res, next) => {
    const { hostname } = req
    const id = find_server(hostname, servers)

    if (id === null) {
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
