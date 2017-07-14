const util = require('util')
const express = require('express')
const conf = require('../../conf')

module.exports = function(group) {
  const router = express.Router()

  function index(req, res) {
    res.render('index')
  }

  function pac(req, res) {
    util.log('Serve proxy.pac')
    if (conf.proxy) {
      res.render('proxy-pac-with-proxy', { conf })
    } else {
      res.render('proxy-pac', { conf })
    }
  }

  router
    .get('/', index)
    .get('/proxy.pac', pac)
    .get(
      '/:id',
      group.exists.bind(group),
      group.start.bind(group),
      group.redirect.bind(group)
    )

  return router
}
