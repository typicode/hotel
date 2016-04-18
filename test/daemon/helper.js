const fs = require('fs')
const path = require('path')
const mock = require('mock-fs')
const untildify = require('untildify')
const conf = require('../../src/conf')
const daemonApp = require('../../src/daemon/app')
const serverGroup = require('../../src/daemon/server-group')
const servers = require('../../src/cli/servers')

module.exports = {
  before,
  after
}

// Set request timeout to 20 seconds instead of 5 seconds for slower CI servers
conf.timeout = 20000

const serverKey = path.join(__dirname, '../../src/daemon/certs/server.key')
const serverCrt = path.join(__dirname, '../../src/daemon/certs/server.crt')

let app

function before () {
  mock({
    [untildify('~/.hotel')]: {},
    // Needed to avoid 404
    [path.join(__dirname, '../../src/daemon/public/index.html')]: 'index.html content',
    [serverKey]: fs.readFileSync(serverKey),
    [serverCrt]: fs.readFileSync(serverCrt)
  })

  servers.add('node index.js', {
    n: 'node',
    p: 51234,
    d: path.join(__dirname, '../fixtures/app')
  })

  servers.add('node index.js', {
    n: 'subdomain.node',
    p: 51235,
    d: path.join(__dirname, '../fixtures/app')
  })

  servers.add('unknown-cmd', { n: 'failing' })

  const group = serverGroup(false)
  app = daemonApp(group)
  app.group = group

  return app
}

function after (done) {
  app.group.shutdown(done)
}
