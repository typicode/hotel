const path = require('path')
const untildify = require('untildify')
const startup = require('user-startup')
const conf = require('../conf')
const pidFile = require('../pid-file')
const debug = require('../utils/debug')

module.exports = {
  start,
  stop
}

// Start daemon in background
function start () {
  const node = process.execPath
  const daemonFile = path.join(__dirname, '../daemon')
  const daemonLog = path.resolve(untildify('~/.hotel/daemon.log'))
  const startupFile = startup.getFile('hotel')

  debug(`creating ${startupFile}`)
  startup.create('hotel', node, [daemonFile], daemonLog)

  console.log(`Started http://localhost:${conf.port}`)
}

// Stop daemon using killURL
function stop (cb) {
  startup.remove('hotel')
  const pid = pidFile.read()
  if (pid) process.kill(pid)
}
