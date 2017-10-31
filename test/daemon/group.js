const test = require('ava')
const sinon = require('sinon')
const Group = require('../../src/daemon/group')
const tcpProxy = require('../../src/daemon/tcp-proxy')
const conf = require('../../src/conf')

const { tld } = conf
sinon.stub(tcpProxy, 'proxy')

test('group.resolve should find the correct server or target id', t => {
  const group = Group()
  const conf = { target: 'http://example.com' }
  group.add('app', conf)
  group.add('foo.app', conf)

  t.is(group.resolve('app'), 'app')
  t.is(group.resolve('bar.app'), 'app')
  t.is(group.resolve('foo.app'), 'foo.app')
  t.is(group.resolve('baz.foo.app'), 'foo.app')
})

test('group.handleUpgrade with proxy', t => {
  const group = Group()
  const target = 'example.com'
  const req = {
    headers: {
      host: `proxy.${tld}:80`
    }
  }
  const head = {}
  const socket = {}

  sinon.stub(group._proxy, 'ws')

  group.add('proxy', { target: `http://${target}` })
  group.handleUpgrade(req, head, socket)

  sinon.assert.calledWith(group._proxy.ws, req, head, socket, {
    target: `ws://${target}`
  })
  t.pass()
})

test('group.handleUpgrade with app', t => {
  const group = Group()
  const PORT = '9000'
  const req = {
    headers: {
      host: `app.${tld}:80`
    }
  }
  const head = {}
  const socket = {}

  sinon.stub(group._proxy, 'ws')

  group.add('app', {
    cmd: 'cmd',
    cwd: '/some/path',
    env: {
      PORT
    }
  })
  group.handleUpgrade(req, head, socket)

  sinon.assert.calledWith(group._proxy.ws, req, head, socket, {
    target: `ws://127.0.0.1:${PORT}`
  })
  t.pass()
})

test('group.handleUpgrade with app and port, port should take precedence', t => {
  const port = 5000
  const group = Group()
  const req = {
    headers: {
      host: `app.${tld}:${port}`
    }
  }
  const head = {}
  const socket = {}

  sinon.stub(group._proxy, 'ws')

  group.add('app', {
    cmd: 'cmd',
    cwd: '/some/path'
  })
  group.handleUpgrade(req, head, socket)

  sinon.assert.calledWith(group._proxy.ws, req, head, socket, {
    target: `ws://127.0.0.1:${port}`
  })
  t.pass()
})

test('group.handleConnect with proxy', t => {
  const group = Group()
  const target = 'example.com'
  const req = {
    headers: {
      host: `proxy.${tld}:80`
    }
  }
  const head = {}
  const socket = {}

  tcpProxy.proxy.reset()

  group.add('proxy', { target: `http://${target}` })
  group.handleConnect(req, head, socket)

  sinon.assert.calledWith(tcpProxy.proxy, socket, 80, 'example.com')
  t.pass()
})

test('group.handleConnect with app', t => {
  const group = Group()
  const PORT = '9000'
  const req = {
    headers: {
      host: `app.${tld}:80`
    }
  }
  const head = {}
  const socket = {}

  tcpProxy.proxy.reset()

  group.add('app', {
    cmd: 'cmd',
    cwd: '/some/path',
    env: {
      PORT
    }
  })
  group.handleConnect(req, head, socket)

  sinon.assert.calledWith(tcpProxy.proxy, socket, PORT)
  t.pass()
})

test('group.handleConnect on port 443', t => {
  const group = Group()
  const req = {
    headers: {
      host: `anything.${tld}:443`
    }
  }
  const head = {}
  const socket = {}

  tcpProxy.proxy.reset()
  group.handleConnect(req, head, socket)

  sinon.assert.calledWith(tcpProxy.proxy, socket, conf.port + 1)
  t.pass()
})
