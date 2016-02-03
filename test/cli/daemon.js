/* global describe, before, after, it */
const path = require('path')
const sinon = require('sinon')
const mock = require('mock-fs')
const untildify = require('untildify')
const userStartup = require('user-startup')
const daemon = require('../../src/cli/daemon')

describe('start|stop', () => {
  let sandbox

  before(() => {
    mock({
      '~/.hotel/daemon.pid': '1234'
    })

    sandbox = sinon.sandbox.create()
    sandbox.stub(userStartup, 'create')
    sandbox.stub(userStartup, 'remove')
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
  })

  it('should stop daemon', () => {
    daemon.stop(() => {
      sinon.assert.calledWithExactly(userStartup.remove, 'hotel')
      sinon.assert.calledWithExactly(process.kill, '1234')
    })
  })
})
