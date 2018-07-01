const fs = require('fs')
const test = require('ava')
// TODO rename to KEY_NAME
const { KEY_FILE, CERT_FILE, generate } = require('../../src/daemon/pem')
const { hotelDir } = require('../../src/common')

test.before(() => {
  fs.mkdirSync(hotelDir)
})

test("should create cert files if they don't exist", t => {
  const { key, cert } = generate()
  t.true(fs.existsSync(KEY_FILE))
  t.true(fs.existsSync(CERT_FILE))
  t.is(key, fs.readFileSync(KEY_FILE, 'utf-8'))
  t.is(cert, fs.readFileSync(CERT_FILE, 'utf-8'))
})

test('should read cert files if they exist', t => {
  fs.writeFileSync(KEY_FILE, 'foo')
  fs.writeFileSync(CERT_FILE, 'bar')
  const { key, cert } = generate()
  t.is('foo', key)
  t.is('bar', cert)
})
