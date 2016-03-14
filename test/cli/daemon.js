/* global describe, before, after, it */
const fs = require('fs')
const path = require('path')
const assert = require('assert')
const sinon = require('sinon')
const mock = require('mock-fs')
const untildify = require('untildify')
const userStartup = require('user-startup')
const common = require('../../src/common')
const daemon = require('../../src/cli/daemon')

describe('start|stop', () => {
  let sandbox

  before(() => {
    sandbox = sinon.sandbox.create()
    sandbox.stub(userStartup, 'create')
    sandbox.stub(process, 'kill')
  })

  after(() => {
    mock.restore()
    sandbox.restore()
  })

  it('should start daemon', () => {
    const node = process.execPath
    const daemonFile = path.join(__dirname, '../../src/daemon')
    const daemonLog = path.resolve(untildify('~/.hotel/daemon.log'))

    daemon.start()

    sinon.assert.calledWithExactly(
      userStartup.create,
      'hotel', node, [daemonFile], daemonLog
    )

    assert.equal(
      fs.readFileSync(common.startupFile),
      userStartup.getFile('hotel')
    )
  })

  it('should stop daemon', () => {
    mock({
      [common.pidFile]: '1234',
      [common.startupFile]: userStartup.getFile('hotel'),
      [userStartup.getFile('hotel')]: 'startup script'
    })
    daemon.stop()

    assert(
      !fs.existsSync(userStartup.getFile('hotel')),
      'user-startup script not removed'
    )

    assert(
      !fs.existsSync(common.startupFile),
      '~/.hotel/startup not removed'
    )

    sinon.assert.calledWithExactly(process.kill, '1234')
  })
})
