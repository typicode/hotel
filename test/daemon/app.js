const path = require('path')
const http = require('http')
const test = require('ava')
const request = require('supertest')
const conf = require('../../src/conf')
const App = require('../../src/daemon/app')
const Group = require('../../src/daemon/group')
const Loader = require('../../src/daemon/loader')
const servers = require('../../src/cli/servers')

let app

test.before(() => {
  // Set request timeout to 20 seconds instead of 5 seconds for slower CI servers
  conf.timeout = 20000

  // Fake server to respond to URL
  http
    .createServer((req, res) => {
      res.statusCode = 200
      res.end(`ok - host: ${req.headers.host}`)
    })
    .listen(4000)

  // Add server
  servers.add('node index.js', {
    name: 'node',
    port: 51234,
    dir: path.join(__dirname, '../fixtures/app'),
    out: '/tmp/logs/app.log',
    xfwd: true
  })

  // Add server with subdomain
  servers.add('node index.js', {
    name: 'subdomain.node',
    port: 51235,
    dir: path.join(__dirname, '../fixtures/app'),
    out: '/tmp/logs/app.log'
  })

  // Add server with custom env
  process.env.FOO = 'FOO_VALUE'
  servers.add('node index.js', {
    name: 'custom-env',
    port: 51236,
    dir: path.join(__dirname, '../fixtures/app'),
    out: '/tmp/logs/app.log',
    env: ['FOO'],
    httpProxyEnv: true
  })

  // Add failing server
  servers.add('unknown-cmd', { name: 'failing' })

  // Add server and proxy for testing removal
  servers.add('unknown-cmd', { name: 'server-to-remove' })
  servers.add('http://example.com', { name: 'proxy-to-remove' })

  // Add URL
  servers.add('http://localhost:4000', { name: 'proxy' })

  // Add https URL
  servers.add('https://jsonplaceholder.typicode.com', {
    name: 'working-proxy-with-https-target',
    changeOrigin: true
  })

  servers.add('https://jsonplaceholder.typicode.com', {
    name: 'failing-proxy-with-https-target'
  })

  // Add unavailable URL
  servers.add('http://localhost:4100', { name: 'unavailable-proxy' })

  const group = Group()
  app = App(group)
  app.group = group
  Loader(group, { watch: false })
})

test.cb.after(t => app.group.stopAll(t.end))

//
// Test daemon/vhosts/tld.js
//

test.cb('GET http://hotel.dev should return 200', t => {
  request(app).get('/').set('Host', 'hotel.dev').expect(200, t.end)
})

test.cb(
  'GET http://node.dev should proxy request and host should be node.dev',
  t => {
    request(app)
      .get('/')
      .set('Host', 'node.dev')
      .expect(/host: node.dev/)
      .expect(200, /Hello World/, (err, res) => {
        if (err) return t.end(err)
        t.notRegex(
          res.text,
          /http:\/\/127.0.0.1:2000\/proxy.pac/,
          `shouldn't be started with HTTP_PROXY env set`
        )
        return t.end()
      })
  }
)

test.cb('GET http://subdomain.node.dev should proxy request', t => {
  request(app)
    .get('/')
    .set('Host', 'subdomain.node.dev')
    .expect(200, /Hello World/, t.end)
})

test.cb('GET http://any.node.dev should proxy request', t => {
  request(app)
    .get('/')
    .set('Host', 'any.node.dev')
    .expect(200, /Hello World/, t.end)
})

test.cb('GET http://unknown.dev should return 404', t => {
  request(app).get('/').set('Host', 'unknown.dev').expect(404, t.end)
})

test.cb('GET http://failing.dev should return 502', t => {
  request(app).get('/').set('Host', 'failing.dev').expect(502, t.end)
})

test.cb(
  'GET http://proxy.dev should return 200 and host should be proxy.dev',
  t => {
    request(app)
      .get('/')
      .set('Host', 'proxy.dev')
      .expect(200, /host: proxy.dev/, t.end)
  }
)

test.cb('GET http://node.dev:4000 should proxy to localhost:4000', t => {
  request(app).get('/').set('Host', 'node.dev:4000').expect(200, /ok/, t.end)
})

//
// Test proxy to URLs
//

test.cb(
  'GET http://working-proxy-with-https-target.dev should return 200',
  t => {
    request(app)
      .get('/')
      .set('Host', 'working-proxy-with-https-target.dev')
      .expect(200, t.end)
  }
)

test.cb(
  'GET http://failing-proxy-with-https-target.dev should return 502',
  t => {
    request(app)
      .get('/')
      .set('Host', 'failing-proxy-with-https-target.dev')
      .expect(502, t.end)
  }
)

test.cb('GET http://unavailable-proxy.dev should return 502', t => {
  request(app).get('/').set('Host', 'unavailable-proxy.dev').expect(502, t.end)
})

//
// TEST daemon/routers/api.js
//

test.cb('GET /_/servers', t => {
  request(app).get('/_/servers').expect(200, (err, res) => {
    if (err) return t.end(err)
    t.is(Object.keys(res.body).length, 10, 'got wrong number of servers')
    t.end()
  })
})

test.cb('POST /_/servers/:id/start', t => {
  request(app).post('/_/servers/node/start').expect(200, err => {
    if (err) return t.end(err)
    t.is(app.group.find('node').status, 'running')
    t.end()
  })
})

test.cb('POST /_/servers/:id/stop', t => {
  request(app).post('/_/servers/node/stop').expect(200, err => {
    if (err) return t.end(err)
    t.not(app.group.find('node').status, 'running')
    t.end()
  })
})

//
// TEST daemon/routers/index.js
//

test.cb('GET /proxy.pac should serve /proxy.pac', t => {
  request(app).get('/proxy.pac').expect(200, t.end)
})

test.cb('GET http://localhost:2000/node should redirect to node server', t => {
  if (process.env.APPVEYOR) return t.end()
  request(app)
    .get('/node')
    .set('Host', 'localhost')
    .expect('location', /http:\/\/localhost:51234/)
    .expect(302, t.end)
})

test.cb(
  'GET http://127.0.0.1:2000/node should use the same hostname to redirect',
  t => {
    // temporary disable this test on AppVeyor
    // Randomly fails
    if (process.env.APPVEYOR) return t.end()
    request(app)
      .get('/node')
      .expect('location', /http:\/\/127.0.0.1:51234/)
      .expect(302, t.end)
  }
)

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

test.cb('GET / should render index.html', t => {
  request(app).get('/').expect(200, t.end)
})

test.cb('GET /style.css should render style.css', t => {
  request(app).get('/style.css').expect(200, t.end)
})

//
// Test env variables
//

test.cb('GET / should contain custom env values', t => {
  request(app)
    .get('/')
    .set('Host', 'custom-env.dev')
    .expect(200, /FOO_VALUE/, t.end)
})

test.cb('GET / should contain proxy env values', t => {
  request(app)
    .get('/')
    .set('Host', 'custom-env.dev')
    .expect(200, /http:\/\/127.0.0.1:2000\/proxy.pac/, t.end)
})

//
// Test headers
//

test.cb('GET node.dev/ should contain X-FORWARD headers', t => {
  request(app)
    .get('/')
    .set('Host', 'node.dev')
    .expect(200, /x-forwarded-host: node.dev/, t.end)
})

test.cb('GET subdomain.node.dev/ should not contain X-FORWARD headers', t => {
  request(app)
    .get('/')
    .set('Host', 'subdomain.node.dev')
    .expect(200, /x-forwarded-host: undefined/, t.end)
})

//
// Test remove
//

test.cb('Removing a server should make it unavailable', t => {
  t.truthy(app.group.find('server-to-remove'))
  app.group.remove('server-to-remove', () => {
    request(app).get('/').set('Host', 'server-to-remove.dev').expect(404, t.end)
  })
})

test.cb('Removing a proxy should make it unavailable', t => {
  t.truthy(app.group.find('proxy-to-remove'))
  app.group.remove('proxy-to-remove', () => {
    request(app).get('/').set('Host', 'proxy-to-remove.dev').expect(404, t.end)
  })
})
