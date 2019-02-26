const fs = require('fs')
const path = require('path')
const tildify = require('tildify')
const mkcert = require('mkcert')
const log = require('./log')
const { hotelDir } = require('../common')

const KEY_FILE = path.join(hotelDir, 'key.pem')
const CERT_FILE = path.join(hotelDir, 'cert.pem')

async function generate() {
  if (fs.existsSync(KEY_FILE) && fs.existsSync(CERT_FILE)) {
    log(`Reading self-signed certificatw in ${tildify(hotelDir)}`)
    return new Promise((resolve, reject) =>
      resolve({
        key: fs.readFileSync(KEY_FILE, 'utf-8'),
        cert: fs.readFileSync(CERT_FILE, 'utf-8')
      })
    )
  } else {
    log(`Generating self-signed certificate in ${tildify(hotelDir)}`)
    try {
      const ca = await mkcert.createCA({
        organization: 'hotel',
        countryCode: 'US',
        state: 'California',
        locality: 'hotel',
        validityDays: 365
      })
      const pems = await mkcert.createCert({
        domains: ['127.0.0.1', '*.localhost'],
        validityDays: 365,
        caKey: ca.key,
        caCert: ca.cert
      })
      fs.writeFileSync(KEY_FILE, pems.key, 'utf-8')
      fs.writeFileSync(CERT_FILE, pems.cert, 'utf-8')

      return { key: pems.key, cert: pems.cert }
    } catch (err) {
      log(`err in creating CA for certs ${err}`)
    }
  }
}

module.exports = {
  KEY_FILE,
  CERT_FILE,
  generate
}
