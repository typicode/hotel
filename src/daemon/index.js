const exitHook = require('exit-hook')
const httpProxy = require('http-proxy')
const conf = require('../conf')
const pidFile = require('../pid-file')
const pem = require('./pem')
const log = require('./log')
const Group = require('./group')
const Loader = require('./loader')
const App = require('./app')

const group = Group()
const app = App(group)

// Install mkcert
pem.install()

// Load and watch files
Loader(group)

// Create pid file
pidFile.create()

// Generate certificates
pem.generate(group.list()).then(ssl => {
  // Clean exit
  exitHook(() => {
    console.log('Exiting')
    console.log('Stop daemon')
    proxy.close()
    app.close()
    group.stopAll()

    console.log('Remove pid file')
    pidFile.remove()
  })

  // HTTPS proxy
  const proxy = httpProxy.createServer({
    target: {
      host: '127.0.0.1',
      port: conf.port
    },
    ssl,
    ws: true,
    xfwd: true
  })

  // Start HTTPS proxy and HTTP server
  proxy.listen(conf.port + 1)

  app.listen(conf.port, conf.host, function() {
    log(`Server listening on port ${conf.host}:${conf.port}`)
  })
})
