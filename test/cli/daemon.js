/* global describe, before, it */
const path = require('path')
const http = require('http')
const url = require('url')
const sinon = require('sinon')
const untildify = require('untildify')
const userStartup = require('user-startup')
const daemon = require('../../src/cli/daemon')

describe('start|stop', () => {
  let sandbox

  before(() => {
    sandbox = sinon.sandbox.create()
    sandbox.stub(userStartup, 'create')
    sandbox.stub(userStartup, 'remove')
    sandbox.stub(http, 'request')
      .returns({ on: () => {} })
      .callsArg(1)
  })

  after(() => {
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

  it('should stop daemon', done => {
    daemon.stop(() => {
      const opts = url.parse('http://127.0.0.1:2000/_api/kill')
      opts.method = 'POST'
      sinon.assert.calledWith(http.request, opts)
      sinon.assert.calledWithExactly(userStartup.remove, 'hotel')
      done()
    })
  })
})
