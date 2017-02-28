const fs = require('fs')
const path = require('path')
const cp = require('child_process')
const test = require('ava')
const mock = require('mock-fs')
const sinon = require('sinon')
const cli = require('../../src/cli')
const servers = require('../../src/cli/servers')
const run = require('../../src/cli/run')

const { serversDir } = require('../../src/common')
const appDir = path.join(__dirname, '../fixtures/app')

test.before(() => {
  mock({
    [serversDir]: {},
    [appDir]: {
      'index.js': fs.readFileSync(path.join(appDir, 'index.js'))
    }
  })

  sinon.spy(servers, 'add')
  sinon.spy(servers, 'rm')
})

test.afterEach(() => {
  process.exit.restore && process.exit.restore()
  run.spawn.restore && run.spawn.restore()
})

test.cb('spawn', (t) => {
  t.plan(4)
  const status = 1
  sinon.stub(process, 'exit', () => {})
  sinon.stub(cp, 'spawnSync', () => ({ status }))

  process.chdir(appDir)

  const opts = {}

  run.spawn('node index.js', opts)

  // test that everything was called correctly
  t.regex(
    servers.add.firstCall.args[0], /http:\/\/localhost:/,
    'should add a target'
  )

  t.is(
    servers.add.firstCall.args[1],
    opts,
    'should pass options to add'
  )

  t.is(
    servers.rm.firstCall.args[0],
    opts,
    'should use same options to remove'
  )

  t.is(
    process.exit.firstCall.args[0],
    status,
    'should exit'
  )
})

test('cli', (t) => {
  sinon.stub(run, 'spawn', () => {})
  cli([ '', '', 'run', 'node index.js' ])
  t.true(run.spawn.called)
})
