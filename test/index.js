/* global describe, before, after, it */
process.env.HOME = `${__dirname}/home`
process.env.USERPROFILE = `${__dirname}/home`

let assert = require('assert')
let cp = require('child_process')
let fs = require('fs')
let path = require('path')
var http = require('http')
let supertest = require('supertest')
let untildify = require('untildify')
let rmrf = require('rimraf')
let pkg = require('../package.json')

let isCI = process.env.TRAVIS || process.env.CI
let timeout = isCI ? 10000 : 5000
let url = 'http://localhost:2000'

// Used to give some time to the system and commands
function wait (done) {
  setTimeout(done, timeout)
}

// Used to give some time to the system and commands,
// but specify a condition to wait for
function waitFor (condition, done) {
  let start = new Date()
  retry()

  function retry() {
    if (new Date() - start > timeout) return done()
    setTimeout(() => {
      condition((err) => {
        if (!err) return done()
        else retry()
      })
    }, 250)
  }
}

function forUp (cb) {
  http.get(url, () => { cb() })
    .on('error', (e) => { cb(e) })
}

function forDown (cb) {
  http.get(url, () => { cb(new Error()) })
    .on('error', (e) => { cb() })
}

function hotel (cmd) {
  // Execute hotel cmd
  let out = cp.execSync(`node ${__dirname}/../${pkg.bin} ${cmd}`, {
    cwd: `${__dirname}/app`
  }).toString()

  // Log output
  // .replace() used to enhance tests readability
  if (!process.env.QUIET) {
    console.log(out
      .replace(/\n {2}/g, '\n    ')
      .replace(/\n$/, ''))
  }

  // Return output
  return out
}

let request = supertest(url)

describe('hotel', function () {

  this.timeout(timeout * 1.2)

  before((done) => {
    hotel('stop') // Just in case
    rmrf.sync(untildify('~/.hotel'))
    waitFor(forDown, done)
  })

  after(() => hotel('stop'))

  describe('$ hotel start', () => {

    before(done => {
      hotel('start')
      waitFor(forUp, done)
    })

    it('should start daemon', done => {
      request.get('/').expect(200, done)
    })
  })

  describe('app$ hotel add "node index.js"', () => {

    before(done => {
      hotel('add "node index.js"')
      wait(done)
    })

    it('should create a redirection from /app to app server', done => {
      request
        .get('/app')
        .expect(302, (err, res) => {
          if (err) throw err

          // Test redirection
          supertest(res.header.location)
            .get('/')
            .expect(200, done)
        })
    })
  })

  describe('app$ hotel add -n name -o output.log -e PATH "node index.js"', () => {

    before(done => {
      hotel('add -n name -o output.log -e PATH "node index.js"')
      wait(done)
    })

    it('should create a redirection from /name to app server', done => {
      request
        .get('/name')
        .expect(302, (err, res) => {
          if (err) throw err

          // Test redirection
          supertest(res.header.location)
            .get('/')
            // Server is configured to return PATH,
            // in order to test that PATH was passed to the server
            .expect(new RegExp(process.env.PATH))
            .expect(200, done)
        })
    })

    it('should use the same hostname to redirect', done => {
      supertest(`http://127.0.0.1:2000`)
        .get('/name')
        .expect('location', /http:\/\/127.0.0.1/)
        .expect(302, done)
    })

    it('should write output to output.log', () => {
      let log = fs.readFileSync(`${__dirname}/app/output.log`, 'utf-8')
      assert(log.includes('Server running'))
    })
  })

  describe('app$ hotel ls', () => {

    it('should return server list', () => {
      assert(hotel('ls').includes('app'))
    })

  })

  describe('app$ hotel rm', () => {

    before(done => {
      hotel('rm')
      wait(done)
    })

    it('should remove server', done => {
      request
        .get('/app')
        .expect(302)
        .expect('location', '/', done)
    })

  })

  describe('$ hotel stop', () => {

    before((done) => {
      hotel('stop')
      wait(done)
    })

    it('should stop daemon', (done) => {
      request.get('/').end((err) => {
        if (err) return done()
        throw new Error('Daemon should not be accessible')
      })
    })

  })

})
