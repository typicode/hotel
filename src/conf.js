const fs = require('fs')
const mkdirp = require('mkdirp')
const { hotelDir, confFile } = require('./common')

// Create dir
mkdirp.sync(hotelDir)

// Defaults
const defaults = {
  port: 2000,
  host: '127.0.0.1',
  timeout: 5000,
  tld: 'dev'
}

// Create conf it it doesn't exist
const data = JSON.stringify(defaults, null, 2)
if (!fs.existsSync(confFile)) fs.writeFileSync(confFile, data)

// Read file
const conf = JSON.parse(fs.readFileSync(confFile))

// Assign defaults and export
module.exports = Object.assign(defaults, conf)
