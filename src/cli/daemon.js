const fs = require('fs')
const path = require('path')
const mkdirp = require('mkdirp')
const startup = require('user-startup')
const common = require('../common')
const conf = require('../conf')
const uninstall = require('../scripts/uninstall')
const log = require('../daemon/log')

module.exports = {
  start,
  stop
}

// Start daemon in background
function start() {
  const node = process.execPath
  const daemonFile = path.join(__dirname, '../daemon')
  const startupFile = startup.getFile('hotel')

  startup.create('hotel', node, [daemonFile], common.logFile)

  // Save startup file path in ~/.hotel
  // Will be used later by uninstall script
  mkdirp.sync(common.hotelDir)
  fs.writeFileSync(common.startupFile, startupFile)

  // Verify daemon started by checking if pid file exists after a short delay
  setTimeout(() => {
    if (fs.existsSync(common.pidFile)) {
      console.log(`Started http://localhost:${conf.port}`)
    } else {
      console.log(`Start command sent. Check ${common.logFile} for details.`)
      console.log(`If hotel doesn't start, try running: node ${daemonFile}`)
    }
  }, 500)
}

// Stop daemon
function stop() {
  startup.remove('hotel')
  // kills process and clean stuff in ~/.hotel
  uninstall()
  console.log('Stopped')
}
