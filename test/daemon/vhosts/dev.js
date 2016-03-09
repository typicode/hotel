/* global describe, before, after, it */
const request = require('supertest')
const helper = require('../helper')

describe('*.tld', () => {
  let app
  before(() => app = helper.before())
  after(helper.after)

  describe('GET http://node.dev', () => {
    it('should proxy request', done => {
      request(app)
        .get('/')
        .set('Host', 'node.dev')
        .expect(200, /Hello World/, done)
    })
  })

  describe('GET http://subdomain.node.dev', () => {
    it('should proxy request', done => {
      request(app)
        .get('/')
        .set('Host', 'subdomain.node.dev')
        .expect(200, /Hello World/, done)
    })
  })

  describe('GET http://unknown.dev', () => {
    it('should return 404', done => {
      request(app)
        .get('/')
        .set('Host', 'unknown.dev')
        .expect(404, done)
    })
  })

  describe('GET http://failing.dev', () => {
    it('should return 502', done => {
      request(app)
        .get('/')
        .set('Host', 'failing.dev')
        .expect(502, done)
    })
  })
})
