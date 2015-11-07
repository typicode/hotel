const path = require('path')
const got = require('got')
const untildify = require('untildify')
const startup = require('user-startup')
const conf = require('../conf')
const debug = require('../utils/debug')

const startupFile = startup.getFile('hotel')

const killURL = `http://127.0.0.1:${conf.port}/kill`

module.exports = {
  start,
  stop
}

// Start daemon in background
function start () {
  let node = process.execPath
  let daemonFile = path.join(__dirname, '../daemon')
  let daemonLog = path.resolve(untildify('~/.hotel/daemon.log'))

  debug(`creating ${startupFile}`)
  startup.create('hotel', node, [daemonFile], daemonLog)

  console.log(`  Started http://localhost:${conf.port}`)
}

// Stop daemon using killURL
function stop (cb) {
  got.post(killURL, { timeout: 1000, retries: 0 }, (err) => {
    console.log(err ? '  Not running' : '  Stopped daemon')

    debug(`removing ${startupFile}`)
    startup.remove('hotel')

    cb()
  })
}
