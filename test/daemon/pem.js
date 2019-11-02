const fs = require('fs')
const test = require('ava')
// TODO rename to KEY_NAME
const { KEY_FILE, CERT_FILE, generate } = require('../../src/daemon/pem')
const { hotelDir } = require('../../src/common')

test.before(() => {
  if (!fs.existsSync(hotelDir)) {
    fs.mkdirSync(hotelDir)
  }
})

test("should create cert files if they don't exist", t => {
  return generate().then(ssl => {
    t.true(fs.existsSync(KEY_FILE))
    t.true(fs.existsSync(CERT_FILE))
    t.is(ssl.key, fs.readFileSync(KEY_FILE, 'utf-8'))
    t.is(ssl.cert, fs.readFileSync(CERT_FILE, 'utf-8'))
  })
})
