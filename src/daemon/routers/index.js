const util = require('util')
const express = require('express')
const proxyPac = require('../views/proxy-pac')

module.exports = function (group) {
  let router = express.Router()

  function pac (req, res) {
    util.log('Serve proxy.pac')
    res.send(proxyPac)
  }

  router
    .get('/proxy.pac', pac)
    .get(
      '/:id',
      group.exists.bind(group),
      group.start.bind(group),
      group.redirect.bind(group)
    )

  return router
}
