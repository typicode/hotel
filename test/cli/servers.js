const fs = require('fs')
const path = require('path')
const test = require('ava')
const sinon = require('sinon')
const servers = require('../../src/cli/servers')
const cli = require('../../src/cli')
const { serversDir } = require('../../src/common')

const appDir = path.join(__dirname, '../fixtures/app')

test('add should create file', t => {
  process.chdir(appDir)
  cli(['', '', 'add', 'node index.js'])

  const file = path.join(serversDir, 'app.json')
  const conf = {
    cmd: 'node index.js',
    cwd: process.cwd(),
    env: {
      PATH: process.env.PATH
    }
  }

  const actual = JSON.parse(fs.readFileSync(file))
  t.deepEqual(actual, conf)
})

test('add should create file with URL safe characters by defaults', t => {
  cli(['', '', 'add', 'node index.js', '--dir', '/_-Some Project_Name--'])

  const file = path.join(serversDir, 'some-project-name.json')

  t.true(fs.existsSync(file))
})

test('add should create file with URL safe characters by defaults', t => {
  cli(['', '', 'add', 'node index.js', '--name', '/_-Some Project_Name--'])

  const file = path.join(serversDir, 'some-project-name.json')

  t.true(fs.existsSync(file))
})

test('add should support options', t => {
  process.env.FOO = 'FOO_VALUE'
  process.env.BAR = 'BAR_VALUE'
  const cmd = 'node index.js'
  const name = 'project'
  const port = 3000
  const out = '/some/path/out.log'
  const env = ['FOO', 'BAR']

  cli([
    '',
    '',
    'add',
    cmd,
    '-n',
    name,
    '-p',
    port,
    '-o',
    out,
    '-e',
    env[0],
    env[1],
    '-x',
    '--co',
    '--http-proxy-env'
  ])

  const file = path.join(serversDir, 'project.json')
  const conf = {
    cmd: 'node index.js',
    cwd: process.cwd(),
    out: out,
    env: {
      PATH: process.env.PATH,
      FOO: process.env.FOO,
      BAR: process.env.BAR,
      PORT: port
    },
    xfwd: true,
    changeOrigin: true,
    httpProxyEnv: true
  }

  const actual = JSON.parse(fs.readFileSync(file))
  t.deepEqual(actual, conf)
})

test('add should support option aliases', t => {
  process.env.FOO = 'FOO'
  const cmd = 'node index.js'
  const name = 'alias-test'

  cli(['', '', 'add', cmd, '-n', name])

  const file = path.join(serversDir, 'alias-test.json')
  t.true(fs.existsSync(file))
})

test('add should support URL', t => {
  cli(['', '', 'add', 'http://1.2.3.4', '-n', 'proxy'])

  const file = path.join(serversDir, 'proxy.json')
  const conf = {
    target: 'http://1.2.3.4'
  }

  const actual = JSON.parse(fs.readFileSync(file))
  t.deepEqual(actual, conf)
})

test('add should support URL and options', t => {
  cli(['', '', 'add', 'http://1.2.3.4', '-n', 'proxy', '-x', '--co'])

  const file = path.join(serversDir, 'proxy.json')
  const conf = {
    target: 'http://1.2.3.4',
    xfwd: true,
    changeOrigin: true
  }

  const actual = JSON.parse(fs.readFileSync(file))
  t.deepEqual(actual, conf)
})

/*
FIXME fails for an unknown reason only in CI, process.chdir doesn't seem to change dir
test('rm should remove file', (t) => {
  const file = path.join(serversDir, 'other-app.json')
  fs.writeFileSync(file, '')

  process.chdir(otherAppDir)
  cli(['', '', 'rm'])
  t.true(!fs.existsSync(file))
})
*/

test('rm should remove file using name', t => {
  const name = 'some-other-app'
  const file = path.join(serversDir, `${name}.json`)

  fs.writeFileSync(file, '')
  cli(['', '', 'rm', '-n', name])
  t.true(!fs.existsSync(file))
})

test('ls', t => {
  sinon.spy(servers, 'ls')
  cli(['', '', 'ls'])
  sinon.assert.calledOnce(servers.ls)
  t.pass()
})

test('ls should ignore non-json files', t => {
  const name = '.DS_Store'
  const file = path.join(serversDir, `${name}`)
  fs.writeFileSync(file, '')

  t.notThrows(() => {
    cli(['', '', 'ls'])
  })
})
