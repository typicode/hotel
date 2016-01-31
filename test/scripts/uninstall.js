/* global describe, before, it */
const sinon = require('sinon')
const daemon = require('../../src/cli/daemon')

describe('uninstall', () => {
  before(() => {
    sinon.stub(daemon, 'stop')
    require('../../src/scripts/uninstall')
  })

  it('should call daemon.stop', () => {
    sinon.assert.called(daemon.stop)
  })
})
