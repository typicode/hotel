let fs = require('fs')
let path = require('path')
let got = require('got')
let untildify = require('untildify')
let spawn = require('child_process').spawn
let conf = require('../conf')

module.exports = {
  start: start,
  stop: stop
}

let killURL = `http://127.0.0.1:${conf.port}/kill`

// Start daemon in background
function start () {
  console.log('Start daemon')

  // Open ~/.hotel/daemon.log
  let daemonLog = untildify('~/.hotel/daemon.log')
  console.log('Create', daemonLog)
  let out = fs.openSync(daemonLog, 'w')

  // Spawn daemon and detach process
  let daemonFile = path.join(__dirname, '../daemon')
  let node = process.execPath
  console.log(`Spawn ${node} ${daemonFile}`)
  spawn(node, [daemonFile], {
      stdio: ['ignore', out, out],
      detached: true
    })
    .on('error', console.log)
    .unref()

  // Started
  console.log('Started')
}

// Stop daemon using killURL
function stop () {
  console.log('Stop daemon')

  got.post(killURL, (err) => {
    // Assume it's not running
    if (err) return console.log('Not running')

    // Stopped
    console.log('Stopped')
  })
}
