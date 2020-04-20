const cp = require('child_process')
const fs = require('fs')
const path = require('path')
const mkdirp = require('mkdirp')
const startup = require('user-startup')
const common = require('../common')
const conf = require('../conf')
const pidFile = require('../pid-file')
const uninstall = require('../scripts/uninstall')

module.exports = {
  start,
  stop
}

// Start daemon in background
function start() {
  const node = process.execPath
  const daemonFile = path.join(__dirname, '../daemon')

  const pid = pidFile.read()
  if (pid) {
    console.log(`Already running (process ${pid})`)
    return
  }

  if (conf.autostart) {
    const startupFile = startup.getFile('hotel')
    startup.create('hotel', node, [daemonFile], common.logFile)

    // Save startup file path in ~/.hotel
    // Will be used later by uninstall script
    mkdirp.sync(common.hotelDir)
    fs.writeFileSync(common.startupFile, startupFile)
  } else {
    const fd = fs.openSync(common.logFile, 'w')
    const opts = {
      detached: true, // needed to unref() below
      stdio: ['ignore', fd, fd]
    }

    cp
      .spawn(node, [daemonFile], opts)
      .on('error', console.log)
      .unref()
  }

  console.log(`Started http://localhost:${conf.port}`)
}

// Stop daemon
function stop() {
  startup.remove('hotel')
  // kills process and clean stuff in ~/.hotel
  uninstall()
  console.log('Stopped')
}
