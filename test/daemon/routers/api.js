/* global describe, after, it */
const request = require('supertest')
const assert = require('assert')
const app = require('../helper').createApp()

describe('routers/api', () => {
  after(done => app.shutdown(done))

  describe('GET /_api/servers', () => {
    it('should return monitor list', done => {
      request(app)
        .get('/_api/servers')
        .expect(200, (err, res) => {
          if (err) return done(err)
          assert.equal(res.body.monitors.length, 2)
          done()
        })
    })
  })

  describe('POST /_api/servers/:id/start', () => {
    it('should start monitor', done => {
      request(app)
        .post('/_api/servers/node/start')
        .expect(200, err => {
          if (err) return done(err)
          assert.equal(app.group.get('node').status, 'running')
          done()
        })
    })
  })

  describe('POST /_api/servers/:id/stop', () => {
    it('should start monitor', done => {
      request(app)
        .post('/_api/servers/node/stop')
        .expect(200, err => {
          if (err) return done(err)
          assert.equal(app.group.get('node').status, 'stopping')
          done()
        })
    })
  })
})
