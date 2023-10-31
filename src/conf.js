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
  tld: 'localhost',
  // Replace with your network proxy IP (1.2.3.4:5000) if any
  // For example, if you're behind a corporate proxy
  proxy: false,
  // Set to false to disable automatic running on startup.
  autostart: true
}

// Create empty conf it it doesn't exist
if (!fs.existsSync(confFile)) fs.writeFileSync(confFile, '{}')

// Read file
const conf = JSON.parse(fs.readFileSync(confFile))

// Assign defaults and export
module.exports = { ...defaults, ...conf }
