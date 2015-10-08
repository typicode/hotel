/* global describe, before, after, it */
process.env.NODE_ENV = 'test'
process.env.HOME = `${__dirname}/home`
process.env.USERPROFILE = `${__dirname}/home`

let assert = require('assert')
let cp = require('child_process')
let fs = require('fs')
var http = require('http')
let supertest = require('supertest')
let untildify = require('untildify')
let rmrf = require('rimraf')
let pkg = require('../package.json')

let url = 'http://localhost:2000'

// Used to give some time to the system and commands
function wait (done) {
  setTimeout(done, 1000)
}

// Used to give some time to the system and commands,
// but specify a condition to wait for
function waitFor (condition, done) {
  function retry () {
    setTimeout(() => {
      condition(err => {
        if (!err) return done()
        retry()
      })
    }, 250)
  }

  retry()
}

function isUp (cb) {
  http
    .get(url, () => cb())
    .on('error', cb)
}

function isDown (cb) {
  http
    .get(url, () => cb(new Error()))
    .on('error', () => cb())
}

function hotel (cmd) {
  // Execute hotel cmd
  let bin = `${__dirname}/../${pkg.bin}`
  let out = cp.execSync(`node ${bin} ${cmd}`, {
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

  before((done) => {
    hotel('stop') // Just in case
    rmrf.sync(untildify('~/.hotel'))
    isDown(done)
  })

  after(() => {
    hotel('stop')
    console.log('~/.hotel/daemon.log')
    console.log(fs.readFileSync(untildify('~/.hotel/daemon.log'), 'utf-8'))
  })

  describe('$ hotel start', () => {

    before(done => {
      hotel('start')
      waitFor(isUp, done)
    })

    it('should start daemon', done => {
      request.get('/').expect(200, done)
    })
  })

  describe('$ hotel add', () => {

    before(done => {
      // Set custom env
      process.env.FOO = 'foo'

      // Add servers
      hotel('add "node index.js"')
      hotel('add -n name -o output.log -e FOO -p 51234 "node index.js"')
      hotel('add -n unknow-command "foo"')

      // Wait for daemon to detect new servers
      wait(done)
    })

    describe('"node index.js"', () => {
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

    describe('-n name -o output.log -e FOO -p 51234 "node index.js"', () => {
      it('should create a redirection from /name to app server', done => {
        request
          .get('/name')
          .expect('location', /:51234/)
          .expect(302, (err, res) => {
            if (err) throw err

            // Test redirection
            supertest(res.header.location)
              .get('/')
              // Server is configured to return PATH and FOO
              .expect(new RegExp(process.env.FOO))
              //.expect(/node_modules/)
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

    describe('app$ hotel add -n unknow-command "foo"', () => {
      it('should return an error', done => {
        request
          .get('/unknow-command')
          .expect(/foo/)
          .expect(502, done)
      })
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

  describe('app$ hotel rm non-existent-app', () => {

    it('should print an error', () => {
      assert(hotel('rm non-existent-app').includes('No such file'))
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
