/* global describe, after, it */
const request = require('supertest')
const app = require('../helper').createApp()

describe('GET hotel.tld', () => {
  after(done => app.shutdown(done))

  it('should return 200', done => {
    request(app)
      .get('/')
      .set('Host', 'hotel.dev')
      .expect(200, done)
  })

  it('should not redirect assets http://hotel.dev/index.html', done => {
    request(app)
      .get('/index.html')
      .set('Host', 'hotel.dev')
      .expect(200, done)
  })

  it('should redirect http://hotel.dev/app to http://app.dev', done => {
    request(app)
      .get('/node')
      .set('Host', 'hotel.dev')
      .expect('Location', 'http://node.dev')
      .expect(302, done)
  })

})
