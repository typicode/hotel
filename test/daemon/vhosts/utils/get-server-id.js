/* global describe, it */
const assert = require('assert')
const getServerId = require('../../../../src/daemon/vhosts/utils/get-server-id')

describe('getServerId', () => {
  it('should find the correct server id', () => {
    const arr = [
      'app',
      'foo.app'
    ]

    assert.equal(getServerId(arr, 'app'), 'app')
    assert.equal(getServerId(arr, 'bar.app'), 'app')
    assert.equal(getServerId(arr, 'foo.app'), 'foo.app')
    assert.equal(getServerId(arr, 'baz.foo.app'), 'foo.app')
  })
})
