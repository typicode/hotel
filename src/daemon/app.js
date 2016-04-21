const util = require('util')
const http = require('http')
const express = require('express')
const vhost = require('vhost')
const httpProxy = require('http-proxy')
const serverReady = require('server-ready')
const conf = require('../conf')

// Require routes
const tcpProxy = require('./tcp-proxy')
const IndexRouter = require('./routers')
const APIRouter = require('./routers/api')
const Events = require('./events')
const TLDHost = require('./vhosts/tld')

const API_ROOT = '/_'

// Take a req and extract server id based on host
function parseReq (req) {
  if (req.headers.host) {
    const [hostname, port] = req.headers.host.split(':')
    const regexp = new RegExp(`.${conf.tld}$`)
    const id = hostname.replace(regexp, '')
    return { id, port }
  } else {
    util.log('No host header found')
    return {}
  }
}

module.exports = (servers) => {
  const app = express()
  const server = http.createServer(app)
  const proxy = httpProxy.createProxyServer()

  // Initialize routes
  const indexRouter = IndexRouter(servers)
  const api = APIRouter(servers)
  const events = Events(servers)
  const tldHost = TLDHost(servers)

  // requests timeout
  serverReady.timeout = conf.timeout

  // Server-sent events for servers
  app.use(`${API_ROOT}/events`, events)

  // API
  app.use(`${API_ROOT}/servers`, api)

  // .tld host
  app.use(vhost(new RegExp(`.*\.${conf.tld}`), tldHost))

  // public
  app.use(express.static(`${__dirname}/public`))

  // localhost router
  app.use(indexRouter)

  // Handle CONNECT, used by WebSockets and https when accessing .dev domains
  server.on('connect', (req, socket, head) => {
    const { id, port } = parseReq(req)

    // If https make socket go through https proxy on 2001
    if (port === '443') return tcpProxy(socket, conf.port + 1)

    if (servers.has(id)) {
      const server = servers.start(id)
      const { PORT } = server.env

      util.log(`Connect - proxy socket to ${PORT}`)
      tcpProxy(socket, PORT)
    } else {
      util.log(`Can't find server for ${id}`)
      socket.end()
    }
  })

  server.on('upgrade', (req, socket, head) => {
    const { id } = parseReq(req)

    if (servers.has(id)) {
      const server = servers.start(id)
      const { PORT } = server.env
      const target = `ws://127.0.0.1:${PORT}`

      util.log(`Upgrade - proxy WebSocket to ${PORT}`)
      proxy.ws(req, socket, head, { target })
    } else {
      util.log(`Can't find server for ${id}`)
      socket.end()
    }
  })

  return server
}
