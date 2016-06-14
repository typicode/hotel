const fs = require('fs')
const path = require('path')
const test = require('ava')
const sinon = require('sinon')
const mock = require('mock-fs')
const untildify = require('untildify')
const userStartup = require('user-startup')
const common = require('../../src/common')
const daemon = require('../../src/cli/daemon')

test.before(() => {
  sinon.stub(userStartup, 'create')
  sinon.stub(process, 'kill')
})

test('start should start daemon', (t) => {
  const node = process.execPath
  const daemonFile = path.join(__dirname, '../../src/daemon')
  const daemonLog = path.resolve(untildify('~/.hotel/daemon.log'))

  daemon.start()

  sinon.assert.calledWithExactly(
    userStartup.create,
    'hotel', node, [daemonFile], daemonLog
  )

  t.is(
    fs.readFileSync(common.startupFile, 'utf-8'),
    userStartup.getFile('hotel'),
    'startupFile should point to startup file path'
  )
})

test('stop should stop daemon', (t) => {
  mock({
    [common.pidFile]: '1234',
    [common.startupFile]: userStartup.getFile('hotel'),
    [userStartup.getFile('hotel')]: 'startup script'
  })
  daemon.stop()

  t.truthy(
    !fs.existsSync(userStartup.getFile('hotel')),
    'user-startup script not removed'
  )

  t.truthy(
    !fs.existsSync(common.startupFile),
    '~/.hotel/startup not removed'
  )

  sinon.assert.calledWithExactly(process.kill, '1234')
})
