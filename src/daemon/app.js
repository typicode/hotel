const util = require('util')
const http = require('http')
const express = require('express')
const vhost = require('vhost')
const serverReady = require('server-ready')
const conf = require('../conf')

// Require routes
const tcpProxy = require('./tcp-proxy')
const IndexRouter = require('./routers')
const APIRouter = require('./routers/api')
const Events = require('./events')
const HotelHost = require('./vhosts/hotel-dev')
const DevHost = require('./vhosts/dev')

const API_ROOT = '/_'

module.exports = servers => {
  const app = express()
  const server = http.createServer(app)

  // Initialize routes
  const indexRouter = IndexRouter(servers)
  const api = APIRouter(servers)
  const events = Events(servers)
  const hotelHost = HotelHost(servers)
  const devHost = DevHost(servers)

  // requests timeout
  serverReady.timeout = conf.timeout

  // Server-sent events for servers
  app.use(`${API_ROOT}/events`, events)

  // API
  app.use(`${API_ROOT}/servers`, api)

  // .dev hosts
  app.use(vhost(`hotel.${conf.tld}`, hotelHost))
  app.use(vhost(new RegExp(`.*\.${conf.tld}`), devHost))

  // public
  app.use(express.static(`${__dirname}/public`))

  // Server router
  app.use(indexRouter)

  // Handle CONNECT, used by WebSockets when accessing .dev domains
  server.on('connect', (req, socket, head) => {
    const hostname = req.headers.host.split(':')[0]
    const regexp = new RegExp(`.${conf.tld}$`)
    const id = hostname.replace(regexp, '')

    if (hostname === `hotel.${conf.tld}`) {
      util.log(`Proxy socket to ${conf.port}`)
      tcpProxy(socket, conf.port)
    } else if (servers.has(id)) {
      // Start server
      const server = servers.start(id)

      // Target
      const { PORT } = server.env

      util.log(`Proxy socket to ${PORT}`)
      tcpProxy(socket, PORT)
    } else {
      util.log(`Can't find server for http://${hostname}`)
      socket.end()
    }
  })

  return server
}
