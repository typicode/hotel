const fs = require('fs')
const path = require('path')
const http = require('http')
const mock = require('mock-fs')
const untildify = require('untildify')
const test = require('ava')
const request = require('supertest')
const conf = require('../../src/conf')
const App = require('../../src/daemon/app')
const Group = require('../../src/daemon/group')
const Loader = require('../../src/daemon/loader')
const servers = require('../../src/cli/servers')

let app

test.before((cb) => {
  // Set request timeout to 20 seconds instead of 5 seconds for slower CI servers
  conf.timeout = 20000

  const serverKey = path.join(__dirname, '../../src/daemon/certs/server.key')
  const serverCrt = path.join(__dirname, '../../src/daemon/certs/server.crt')

  mock({
    [untildify('~/.hotel')]: {},
    // Needed to avoid 404
    [path.join(__dirname, '../../src/daemon/public/index.html')]: 'index.html content',
    [path.join(__dirname, '../../dist/bundle.js')]: 'bundle.js content',
    [serverKey]: fs.readFileSync(serverKey),
    [serverCrt]: fs.readFileSync(serverCrt),
    '/tmp/logs': {}
  })

  // Fake server to respond to URL
  http.createServer((req, res) => {
    res.statusCode = 200
    res.end()
  }).listen(4000)

  // Add server
  servers.add('node index.js', {
    n: 'node',
    p: 51234,
    d: path.join(__dirname, '../fixtures/app'),
    o: '/tmp/logs/app.log'
  })

  // Add server with subdomain
  servers.add('node index.js', {
    n: 'subdomain.node',
    p: 51235,
    d: path.join(__dirname, '../fixtures/app'),
    o: '/tmp/logs/app.log'
  })

  // Add failing server
  servers.add('unknown-cmd', { n: 'failing' })

  // Add server for testing removal
  servers.add('unknown-cmd', { n: 'to-be-removed' })

  // Add URL
  servers.add('http://localhost:4000', { n: 'proxy' })

  const group = Group()
  app = App(group)
  app.group = group
  Loader(group, { watch: false })
})

//
// Test daemon/vhosts/tld.js
//

test.cb('GET http://hotel.dev should return 200', (t) => {
  request(app)
    .get('/')
    .set('Host', 'hotel.dev')
    .expect(200, t.end)
})

test.cb('GET http://hotel.dev/index.html should serve index.html', (t) => {
  request(app)
    .get('/index.html')
    .set('Host', 'hotel.dev')
    .expect(200, t.end)
})

test.cb('GET http://node.dev should proxy request', (t) => {
  request(app)
    .get('/')
    .set('Host', 'node.dev')
    .expect(200, /Hello World/, t.end)
})

test.cb('GET http://subdomain.node.dev should proxy request', (t) => {
  request(app)
    .get('/')
    .set('Host', 'subdomain.node.dev')
    .expect(200, /Hello World/, t.end)
})

test.cb('GET http://any.node.dev should proxy request', (t) => {
  request(app)
    .get('/')
    .set('Host', 'any.node.dev')
    .expect(200, /Hello World/, t.end)
})

test.cb('GET http://unknown.dev should return 404', (t) => {
  request(app)
    .get('/')
    .set('Host', 'unknown.dev')
    .expect(404, t.end)
})

test.cb('GET http://failing.dev should return 502', (t) => {
  request(app)
    .get('/')
    .set('Host', 'failing.dev')
    .expect(502, t.end)
})

test.cb('GET http://proxy.dev should return 502', (t) => {
  request(app)
    .get('/')
    .set('Host', 'proxy.dev')
    .expect(200, t.end)
})

//
// TEST daemon/routers/api.js
//

test.cb('GET /_/servers', t => {
  request(app)
    .get('/_/servers')
    .expect(200, (err, res) => {
      if (err) return t.end(err)
      t.is(Object.keys(res.body).length, 5, `got ${JSON.stringify(res.body)}`)
      t.end()
    })
})

test.cb('POST /_/servers/:id/start', t => {
  request(app)
    .post('/_/servers/node/start')
    .expect(200, err => {
      if (err) return t.end(err)
      t.is(app.group.find('node').status, 'running')
      t.end()
    })
})

test.cb('POST /_/servers/:id/stop', t => {
  request(app)
    .post('/_/servers/node/stop')
    .expect(200, err => {
      if (err) return t.end(err)
      t.not(app.group.find('node').status, 'running')
      t.end()
    })
})

//
// TEST daemon/routers/index.js
//

test.cb('GET /proxy.pac should serve /proxy.pac', t => {
  request(app)
    .get('/proxy.pac')
    .expect(200, t.end)
})

test.cb('GET http://localhost:2000/node should redirect to node server', t => {
  if (process.env.APPVEYOR) return t.end()
  request(app)
    .get('/node')
    .set('Host', 'localhost')
    .expect('location', /http:\/\/localhost:51234/)
    .expect(302, t.end)
})

test.cb('GET http://127.0.0.1:2000/node should use the same hostname to redirect', t => {
  // temporary disable this test on AppVeyor
  // Randomly fails
  if (process.env.APPVEYOR) return t.end()
  request(app)
    .get('/node')
    .expect('location', /http:\/\/127.0.0.1:51234/)
    .expect(302, t.end)
})

test.cb('GET http://localhost:2000/proxy should redirect to target', t => {
  if (process.env.APPVEYOR) return t.end()
  request(app)
    .get('/proxy')
    .set('Host', 'localhost')
    .expect('location', /http:\/\/localhost:4000/)
    .expect(302, t.end)
})

//
// Test daemon/app.js
//

test.cb('GET / should render index.html', (t) => {
  request(app)
    .get('/')
    .expect(200, t.end)
})

test.cb('GET /bundle.js should render bundle.js', (t) => {
  request(app)
    .get('/bundle.js')
    .expect(200, t.end)
})

//
// Test remove
//

test.cb('Removing a server should make it unavailable', (t) => {
  app.group.remove('to-be-removed', () => {
    request(app)
      .get('/')
      .set('Host', 'to-be-removed.dev')
      .expect(404, t.end)
  })
})
