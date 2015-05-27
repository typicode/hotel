var fs = require('fs')
var mkdirp = require('mkdirp')
var untildify = require('untildify')

// Create dir
mkdirp.sync(untildify('~/.hotel'))

// Path
var file = untildify('~/.hotel/conf.json')

// Defaults
var conf = { port: 2000 }

// Create file it it doesn't exist
var data = JSON.stringify(conf, null, 2)
if (!fs.existsSync(file)) fs.writeFileSync(file, data)

// Read file
module.exports = JSON.parse(fs.readFileSync(file))
