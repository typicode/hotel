/* global describe, before, it */
const path = require('path')
const http = require('http')
const url = require('url')
const sinon = require('sinon')
const untildify = require('untildify')
const userStartup = require('user-startup')
const daemon = require('../../src/cli/daemon')

describe('start|stop', () => {
  before(() => {
    sinon.stub(userStartup, 'create')
    sinon.stub(userStartup, 'remove')
    sinon.stub(http, 'request')
      .returns({ on: () => {} })
      .callsArg(1)
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
      const opts = url.parse('http://127.0.0.1:2000/kill')
      opts.method = 'POST'
      sinon.assert.calledWith(http.request, opts)
      sinon.assert.calledWithExactly(userStartup.remove, 'hotel')
      done()
    })
  })
})
