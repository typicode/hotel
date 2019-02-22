const fs = require('fs')
const path = require('path')
const test = require('ava')
const sinon = require('sinon')
const untildify = require('untildify')
const userStartup = require('user-startup')
const common = require('../../src/common')
const cli = require('../../src/cli')

test.before(() => {
  sinon.stub(userStartup, 'create')
  sinon.stub(userStartup, 'remove')
  sinon.stub(process, 'kill')
})

test('start should start daemon', t => {
  const node = process.execPath
  const daemonFile = path.join(__dirname, '../../src/daemon/bin.js')
  const args = [daemonFile, 'start', '--hotel-dir', common.hotelDir]
  const daemonLog = path.resolve(untildify('~/.hotel/daemon.log'))

  cli(['', '', 'start'])

  sinon.assert.calledWithExactly(
    userStartup.create,
    'hotel',
    node,
    args,
    daemonLog
  )

  t.is(
    fs.readFileSync(common.startupFile, 'utf-8'),
    userStartup.getFile('hotel'),
    'startupFile should point to startup file path'
  )

  t.pass()
})

test('stop should stop daemon', t => {
  fs.writeFileSync(common.pidFile, '1234')

  cli(['', '', 'stop'])

  sinon.assert.calledWithExactly(userStartup.remove, 'hotel')
  sinon.assert.calledWithExactly(process.kill, '1234')
  t.pass()
})
