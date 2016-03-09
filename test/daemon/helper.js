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

// Set request timeout to 10 seconds instead of 5 seconds for slower CI servers
conf.timeout = 10000

let app

function before () {
  mock({
    [untildify('~/.hotel')]: {},
    // Needed to avoid 404
    [path.join(__dirname, '../../src/daemon/public/index.html')]: 'hello world'
  })

  servers.add('node index.js', {
    n: 'node',
    p: 51234,
    d: `${__dirname}/../fixtures/app`
  })

  servers.add('node index.js', {
   n: 'subdomain.node',
   p: 51235,
   d: `${__dirname}/../fixtures/app`
  })

  servers.add('unknown-cmd', { n: 'failing' })

  const group = serverGroup(false)
  app = daemonApp(group)
  app.group = group

  return app
}

function after (done) {
  app.group.shutdown(done)
  mock.restore()
}
