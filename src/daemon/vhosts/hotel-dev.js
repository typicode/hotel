const util = require('util')
const express = require('express')

// hotel.dev vhost
module.exports = (servers) => {
  const app = express.Router()

  // Redirect http(s)://hotel.dev/:id to http(s)://:id.dev
  app.use('/:id', (req, res, next) => {
    const { protocol } = req
    const { id } = req.params

    if (servers.has(id)) {
      const target = `${protocol}://${id}.dev`
      util.log(`Redirect to ${target}`)
      return res.redirect(target)
    }

    next()
  })

  // Delete host to skip *.dev vhost handler
  app.use((req, res, next) => {
    delete req.headers.host
    next()
  })

  return app
}
