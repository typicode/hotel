let path = require('path')
let tildify = require('tildify')
let untildify = require('untildify')
let startupScript = require('../utils/startup-script')

module.exports = {
  create,
  remove
}

let name = 'hotel'
let file = startupScript.getFile(name)

function create () {
  let execPath = process.execPath
  let binFile = path.resolve(`${__dirname}/../../bin`)
  let cmd = `${execPath} ${binFile} start`
  let logFile = untildify('~/.hotel/daemon.log')

  console.log(`  Create  ${tildify(file)}`)
  startupScript.create(name, cmd, logFile)
  console.log('  Created startup script ')
}

function remove () {
  console.log(`  Remove  ${tildify(file)}`)
  startupScript.remove(name, cmd, logFile)
  console.log('  Removed autostart script')
}
