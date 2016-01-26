const fs = require('fs')
const mkdirp = require('mkdirp')
const untildify = require('untildify')

// Create dir
mkdirp.sync(untildify('~/.hotel'))

// Path
const file = untildify('~/.hotel/conf.json')

// Defaults
const defaults = {
  port: 2000,
  host: '127.0.0.1',
  timeout: 5000,
  tld: 'dev'
}

// Create file it it doesn't exist
const data = JSON.stringify(defaults, null, 2)
if (!fs.existsSync(file)) fs.writeFileSync(file, data)

// Read file
const conf = JSON.parse(fs.readFileSync(file))

// Assign defaults and export
module.exports = Object.assign(defaults, conf)
