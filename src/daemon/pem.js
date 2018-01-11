const fs = require('fs')
const path = require('path')
const tildify = require('tildify')
const selfsigned = require('selfsigned')
const log = require('./log')
const { hotelDir } = require('../common')

const KEY_FILE = path.join(hotelDir, 'key.pem')
const CERT_FILE = path.join(hotelDir, 'cert.pem')

function generate() {
  if (fs.existsSync(KEY_FILE) && fs.existsSync(CERT_FILE)) {
    log(`Reading self-signed certificate in ${tildify(hotelDir)}`)
    return {
      key: fs.readFileSync(KEY_FILE, 'utf-8'),
      cert: fs.readFileSync(CERT_FILE, 'utf-8')
    }
  } else {
    log(`Generating self-signed certificate in ${tildify(hotelDir)}`)
    const pems = selfsigned.generate([{ name: 'commonName', value: 'hotel' }], {
      days: 365
    })
    fs.writeFileSync(KEY_FILE, pems.private, 'utf-8')
    fs.writeFileSync(CERT_FILE, pems.cert, 'utf-8')

    return { key: pems.private, cert: pems.cert }
  }
}

module.exports = {
  KEY_FILE,
  CERT_FILE,
  generate
}
