const path = require('path')
const http = require('http')
const express = require('express')
const vhost = require('vhost')
const serverReady = require('server-ready')
const conf = require('../conf')

// Require routes
const IndexRouter = require('./routers')
const APIRouter = require('./routers/api')
const TLDHost = require('./vhosts/tld')

module.exports = group => {
  const app = express()
  const server = http.createServer(app)

  // Initialize routes
  const indexRouter = IndexRouter(group)
  const api = APIRouter(group)
  const tldHost = TLDHost(group)

  // requests timeout
  serverReady.timeout = conf.timeout

  // Templates
  app.set('views', path.join(__dirname, 'views'))
  app.set('view engine', 'pug')
  app.locals.pretty = true

  // API
  app.use('/_', api)

  // .tld host
  app.use(vhost(new RegExp(`.*.${conf.tld}`), tldHost))

  // app.get('/', (req, res) => res.render('index'))

  // Static files
  // vendors, etc...
  app.use(express.static(path.join(__dirname, 'public')))
  // front files
  app.use(express.static(path.join(__dirname, '../../dist')))

  // localhost router
  app.use(indexRouter)

  // Handle CONNECT, used by WebSockets and https when accessing .localhost domains
  server.on('connect', (req, socket, head) => {
    group.handleConnect(req, socket, head)
  })

  server.on('upgrade', (req, socket, head) => {
    group.handleUpgrade(req, socket, head)
  })

  return server
}
