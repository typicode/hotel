let path = require('path')
let untildify = require('untildify')
let debug = require('../utils/debug')
let startupScript = require('../utils/startup-script')

module.exports = {
  create,
  remove
}

let name = 'hotel'
let file = startupScript.getFile(name)

function create () {
  let cmd = process.execPath
  let daemonFile = path.join(__dirname, '../daemon')
  let logFile = untildify('~/.hotel/daemon.log')

  debug(`create ${file}`)
  startupScript.create(name, cmd, [daemonFile], logFile)
}

function remove () {
  debug(`remove ${file}`)
  startupScript.remove(name)
}
