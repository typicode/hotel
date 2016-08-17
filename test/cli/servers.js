const fs = require('fs')
const path = require('path')
const test = require('ava')
const mock = require('mock-fs')
const sinon = require('sinon')
const servers = require('../../src/cli/servers')
const cli = require('../../src/cli')
const { serversDir } = require('../../src/common')

const appDir = path.join(__dirname, '../fixtures/app')
const otherAppDir = path.join(__dirname, '../fixtures/other-app')

test.before(() => {
  mock({
    [serversDir]: {},
    [appDir]: {
      'index.js': fs.readFileSync(path.join(appDir, 'index.js'))
    },
    [otherAppDir]: {}
  })
})

test('add should create file', (t) => {
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

  t.deepEqual(
    JSON.parse(fs.readFileSync(file)),
    conf
  )
})

test('add should create file with URL safe characters by defaults', (t) => {
  cli([
    '', '',
    'add', 'node index.js',
    '-d', '/_-Some Project_Name--'
  ])

  const file = path.join(serversDir, 'some-project-name.json')

  t.true(fs.existsSync(file))
})

test('add should be possible to force a name', (t) => {
  cli([
    '', '',
    'add', 'node index.js',
    '-n', 'Some Project_Name',
    '-d', '/Some Project_Name'
  ])

  const file = path.join(serversDir, 'Some Project_Name.json')

  t.true(fs.existsSync(file))
})

test('add should support options', (t) => {
  process.env.FOO = 'FOO_VALUE'
  process.env.BAR = 'BAR_VALUE'
  const cmd = 'node index.js'
  const n = 'project'
  const o = '/some/path/out.log'
  const e = ['FOO', 'BAR']
  const p = 3000

  cli([
    '', '',
    'add', cmd,
    '-n', n,
    '-o', o,
    '-e', e[0], e[1],
    '-p', p
  ])

  const file = path.join(serversDir, 'project.json')
  const conf = {
    cmd: 'node index.js',
    cwd: process.cwd(),
    out: o,
    env: {
      PATH: process.env.PATH,
      FOO: process.env.FOO,
      BAR: process.env.BAR,
      PORT: p
    }
  }

  t.deepEqual(
    JSON.parse(fs.readFileSync(file)),
    conf
  )
})

test('add should support option aliases', (t) => {
  process.env.FOO = 'FOO'
  const cmd = 'node index.js'
  const n = 'alias-test'

  cli([
    '', '',
    'add', cmd,
    '--name', n
  ])

  const file = path.join(serversDir, 'alias-test.json')
  t.true(fs.existsSync(file))
})

test('add should support url', (t) => {
  cli([
    '', '',
    'add', 'http://1.2.3.4',
    '-n', 'proxy'
  ])

  const file = path.join(serversDir, 'proxy.json')
  const conf = {
    target: 'http://1.2.3.4'
  }

  t.deepEqual(
    JSON.parse(fs.readFileSync(file)),
    conf
  )
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

test('rm should remove file using name', (t) => {
  const name = 'some-other-app'
  const file = path.join(serversDir, `${name}.json`)

  fs.writeFileSync(file, '')
  cli([
    '', '',
    'rm',
    '-n', name
  ])
  t.true(!fs.existsSync(file))
})

test('ls', (t) => {
  sinon.spy(servers, 'ls')
  cli(['', '', 'ls'])
  sinon.assert.calledOnce(servers.ls)
})
