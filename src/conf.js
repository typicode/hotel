let fs = require('fs')
let mkdirp = require('mkdirp')
let untildify = require('untildify')
let extend = require('xtend')

// Create dir
mkdirp.sync(untildify('~/.hotel'))

// Path
let file = untildify('~/.hotel/conf.json')

// Defaults
let defaults = {
  port: 2000,
  host: '127.0.0.1',
  timeout: 5000
}

// Create file it it doesn't exist
let data = JSON.stringify(defaults, null, 2)
if (!fs.existsSync(file)) fs.writeFileSync(file, data)

// Read file
let conf = JSON.parse(fs.readFileSync(file))

// Assign defaults and export
export default extend(defaults, conf)
