let fs = require('fs')
let path = require('path')
let got = require('got')
let untildify = require('untildify')
let spawn = require('child_process').spawn
let debug = require('../utils/debug')
let conf = require('../conf')

module.exports = {
  start,
  stop
}

let killURL = `http://127.0.0.1:${conf.port}/kill`

// Start daemon in background
function start () {
  // Open ~/.hotel/daemon.log
  let daemonLog = untildify('~/.hotel/daemon.log')
  debug(`create ${daemonLog}`)
  let out = fs.openSync(daemonLog, 'w')

  // Spawn daemon and detach process
  let daemonFile = path.join(__dirname, '../daemon')
  let node = process.execPath
  debug(`spawn ${node} ${daemonFile}`)
  spawn(node, [daemonFile], {
      stdio: ['ignore', out, out],
      detached: true
    })
    .on('error', console.log)
    .unref()

  // Started
  console.log(`  Started http://localhost:${conf.port}`)
}

// Stop daemon using killURL
function stop (cb) {
  got.post(killURL, (err) => {
    if (err) {
      // Assume it's not running
      console.log('  Not running')
    } else {
      // Stopped
      console.log('  Stopped daemon')
    }
    cb()
  })
}
