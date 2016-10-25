const path = require('path')
const http = require('http')
const express = require('express')
const vhost = require('vhost')
const serverReady = require('server-ready')
const conf = require('../conf')

// Require routes
const IndexRouter = require('./routers')
const APIRouter = require('./routers/api')
const Events = require('./events')
const TLDHost = require('./vhosts/tld')

const API_ROOT = '/_'

module.exports = (group) => {
  const app = express()
  const server = http.createServer(app)

  // Initialize routes
  const indexRouter = IndexRouter(group)
  const api = APIRouter(group)
  const events = Events(group)
  const tldHost = TLDHost(group)

  // requests timeout
  serverReady.timeout = conf.timeout

  // Server-sent events for servers
  app.use(`${API_ROOT}/events`, events)

  // API
  app.use(`${API_ROOT}/servers`, api)

  // .tld host
  app.use(vhost(new RegExp(`.*.${conf.tld}`), tldHost))

  // Static files
  // index.html, style.css, vendors, etc...
  app.use(express.static(path.join(__dirname, 'public')))
  // bundle.js
  app.use(express.static(path.join(__dirname, '/../../dist')))

  // localhost router
  app.use(indexRouter)

  // Handle CONNECT, used by WebSockets and https when accessing .dev domains
  server.on('connect', (req, socket, head) => {
    group.handleConnect(req, socket, head)
  })

  server.on('upgrade', (req, socket, head) => {
    group.handleUpgrade(req, socket, head)
  })

  return server
}
