const fs = require('fs')
const path = require('path')
const mkcert = require('mkcert-prebuilt')
const commandExists = require('command-exists').sync
const log = require('./log')
const conf = require('../conf')
const common = require('../common')
const { hotelDir } = require('../common')
const { spawn } = require('child_process')

const KEY_FILE = path.join(hotelDir, 'key.pem')
const CERT_FILE = path.join(hotelDir, 'cert.pem')

function install() {
  if (!commandExists('mkcert')) {
    spawn(mkcert, ['-install'])
  }
}

function generate(list) {
  log('Generating certificate for all hotel domains')
  if (list === null || list === undefined) {
    list = []
  }
  const options = ['-cert-file', 'cert.pem', '-key-file', 'key.pem']
  const defaultDomains = ['127.0.0.1', 'localhost', `hotel.${conf.tld}`]
  const otherDomains = Object.keys(list).map(val => `${val}.${conf.tld}`)

  return new Promise((resolve, reject) => {
    const result = spawn(
      'mkcert',
      options.concat(defaultDomains, otherDomains),
      { cwd: common.hotelDir }
    )
    result.on('close', code => {
      if (code !== 0) {
        log('Error generating ssl certificates !')
        reject(new Error('Error generating ssl certificates'))
        return
      }

      if (!fs.existsSync(KEY_FILE) && !fs.existsSync(CERT_FILE)) {
        log('Error generating ssl certificates')
        reject(new Error('Error generating ssl certificates'))
        return
      }

      log('SSL certificates generated correctly')
      resolve({
        key: fs.readFileSync(KEY_FILE, 'utf-8'),
        cert: fs.readFileSync(CERT_FILE, 'utf-8')
      })
    })
  })
}

module.exports = {
  KEY_FILE,
  CERT_FILE,
  generate,
  install
}
