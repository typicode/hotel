const express = require('express')
const conf = require('../../conf')
const log = require('../log')

// *.tld vhost
module.exports = group => {
  const app = express.Router()
  const hotelRegExp = new RegExp(`hotel.${conf.tld}$`)

  app.use((req, res, next) => {
    const { hostname } = req

    // Skip hotel.tld
    if (hotelRegExp.test(hostname)) {
      log(`hotel.${conf.tld}`)
      return next()
    }

    // If hostname is resolved proxy request
    group.exists(req, res, () => {
      group.start(req, res, () => {
        group.proxy(req, res)
      })
    })
  })

  return app
}
