const util = require('util')
const express = require('express')
const httpProxy = require('http-proxy')
const conf = require('../../conf')

// hotel.dev vhost
module.exports = (servers) => {
  const app = express()
  const proxy = httpProxy.createServer()
  const target = `http://127.0.0.1:${conf.port}`

  // Handle proxy error
  proxy.on('error', (err, req, res) => {
    util.log(err)
    res.status(502).send(err)
  })

  // Redirect http://hotel.dev/:id to http://:id.dev
  app.use('/:id', (req, res, next) => {
    const { id } = req.params

    if (servers.has(id)) {
      const target = `http://${id}.dev`
      util.log(`Redirect to ${target}`)
      return res.redirect(target)
    }

    next()
  })

  // Delete host to avoid loop
  app.use((req, res) => {
    delete req.headers.host
    proxy.web(req, res, { target })
  })

  return app
}
