/* global describe, before, after, it */
const request = require('supertest')
const helper = require('../helper')

describe('*.tld', () => {
  let app
  before(() => app = helper.before())
  after(helper.after)

  describe('GET hotel.tld', () => {
    it('should return 200', done => {
      request(app)
        .get('/')
        .set('Host', 'hotel.dev')
        .expect(200, done)
    })

    it('should serve http://hotel.dev/index.html', done => {
      request(app)
        .get('/index.html')
        .set('Host', 'hotel.dev')
        .expect(200, done)
    })
  })

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

  describe('GET http://any.node.dev', () => {
    it('should proxy request', done => {
      request(app)
        .get('/')
        .set('Host', 'any.node.dev')
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
