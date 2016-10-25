const util = require('util')
const express = require('express')
const conf = require('../../conf')

// *.tld vhost
module.exports = (group) => {
  const app = express.Router()
  const hotelRegExp = new RegExp(`hotel.${conf.tld}$`)

  app.use((req, res, next) => {
    const { hostname } = req

    // Skip hotel.tld
    if (hotelRegExp.test(hostname)) {
      util.log('hotel.dev')
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
