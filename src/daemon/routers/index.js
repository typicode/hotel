const express = require('express')
const conf = require('../../conf')
const log = require('../log')

module.exports = function(group) {
  const router = express.Router()

  function pac(req, res) {
    log('Serve proxy.pac')
    if (conf.proxy) {
      res.render('proxy-pac-with-proxy', { conf, hostname: req.hostname })
    } else {
      res.render('proxy-pac', { conf, hostname: req.hostname })
    }
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
