let fs = require('fs')
let mkdirp = require('mkdirp')
let untildify = require('untildify')

// Create dir
mkdirp.sync(untildify('~/.hotel'))

// Path
let file = untildify('~/.hotel/conf.json')

// Defaults
let conf = { port: 2000 }

// Create file it it doesn't exist
let data = JSON.stringify(conf, null, 2)
if (!fs.existsSync(file)) fs.writeFileSync(file, data)

// Read file
module.exports = JSON.parse(fs.readFileSync(file))
