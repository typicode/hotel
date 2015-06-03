process.env.HOME = `${__dirname}/home`
process.env.USERPROFILE = `${__dirname}/home`

let assert = require('assert')
let cp = require('child_process')
let fs = require('fs')
let path = require('path')
let supertest = require('supertest')
let untildify = require('untildify')
let rmrf = require('rimraf')
let pkg = require('../package.json')

let timeout = process.env.TRAVIS ? 10000 : 5000

// Used to give some time to the system and commands
function wait (done) {
  setTimeout(done, timeout)
}

function hotel (cmd) {
  // Execute hotel cmd
  let out = cp.execSync(`node ${__dirname}/../${pkg.bin} ${cmd}`, {
    cwd: `${__dirname}/app`
  }).toString()

  // Log output
  // .replace() used to enhance tests readability
  console.log(out
    .replace(/\n  /g, '\n    ')
    .replace(/\n$/, ''))

  // Return output
  return out
}

let request = supertest(`http://localhost:2000`)

describe('hotel', function () {

  this.timeout(timeout + 1000)

  before((done) => {
    hotel('stop') // Just in case
    rmrf.sync(untildify('~/.hotel'))
    wait(done)
  })

  after(() => hotel('stop'))

  describe('$ hotel start', () => {

    before(done => {
      hotel('start')
      wait(done)
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
            // Test that PATH was passed to the server
            .expect(new RegExp(process.env.PATH))
            .expect(200, done)
        })
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
