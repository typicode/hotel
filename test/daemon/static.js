/* global describe, before, after, it */
const request = require('supertest')
const helper = require('./helper')

describe('static', () => {
  let app
  before(() => app = helper.before())
  after(helper.after)

  describe('GET /', () => {
    it('should render index.html', done => {
      request(app)
        .get('/')
        .expect(200, done)
    })
  })
})
