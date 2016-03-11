const path = require('path')
const rmrf = require('rimraf')
const conf = require('../../src/conf')
const daemonApp = require('../../src/daemon/app')
const serverGroup = require('../../src/daemon/server-group')
const servers = require('../../src/cli/servers')

const testDir = path.join(__dirname, '/../../tmp')

module.exports = {
  before,
  after
}

// Set request timeout to 10 seconds instead of 5 seconds for slower CI servers
conf.timeout = 10000

let app

function before () {
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
  app.group.shutdown(() => {
    rmrf.sync(testDir)
    done()
  })
}
