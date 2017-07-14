const path = require('path')
const cp = require('child_process')
const test = require('ava')
const sinon = require('sinon')
const cli = require('../../src/cli')
const servers = require('../../src/cli/servers')
const run = require('../../src/cli/run')

const appDir = path.join(__dirname, '../fixtures/app')

test('spawn with port', t => {
  const status = 1

  sinon.spy(servers, 'add')
  sinon.spy(servers, 'rm')

  sinon.stub(process, 'exit', () => {})
  sinon.stub(cp, 'spawnSync', () => ({ status }))

  process.chdir(appDir)

  const opts = { port: 5000 }

  run.spawn('node index.js', opts)

  // test that everything was called correctly
  t.true(servers.add.called)
  t.regex(
    servers.add.firstCall.args[0],
    /http:\/\/localhost:/,
    'should add a target'
  )

  t.is(servers.add.firstCall.args[1], opts, 'should pass options to add')

  t.true(servers.rm.called)
  t.is(servers.rm.firstCall.args[0], opts, 'should use same options to remove')

  t.true(process.exit.called)
  t.is(process.exit.firstCall.args[0], status, 'should exit')
})

test('cli run should call run.spawn', t => {
  sinon.stub(run, 'spawn')
  cli(['', '', 'run', 'node index.js'])

  t.is(run.spawn.firstCall.args[0], 'node index.js')
})
