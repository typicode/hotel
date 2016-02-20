/* global describe, before, after, it */
const request = require('supertest')
const assert = require('assert')
const helper = require('../helper')

describe('routers/api', () => {
  let app
  before(() => app = helper.before())
  after(helper.after)

  describe('GET /_/servers', () => {
    it('should return monitor list', done => {
      request(app)
        .get('/_/servers')
        .expect(200, (err, res) => {
          if (err) return done(err)
          assert.equal(res.body.monitors.length, 2)
          done()
        })
    })
  })

  describe('POST /_/servers/:id/start', () => {
    it('should start monitor', done => {
      request(app)
        .post('/_/servers/node/start')
        .expect(200, err => {
          if (err) return done(err)
          assert.equal(app.group.get('node').status, 'running')
          done()
        })
    })
  })

  describe('POST /_/servers/:id/stop', () => {
    it('should start monitor', done => {
      request(app)
        .post('/_/servers/node/stop')
        .expect(200, err => {
          if (err) return done(err)
          assert.equal(app.group.get('node').status, 'stopping')
          done()
        })
    })
  })
})
