let os = require('os')
let path = require('path')
let got = require('got')
let untildify = require('untildify')
let startup = require('user-startup')
let conf = require('../conf')
let debug = require('../utils/debug')

let startupFile = startup.getFile('hotel')

let killURL = `http://127.0.0.1:${conf.port}/kill`

// Start daemon in background
export function start () {
  let node = process.execPath
  let daemonFile = path.join(__dirname, '../daemon')
  let daemonLog = path.resolve(untildify('~/.hotel/daemon.log'))

  debug(`creating ${startupFile}`)
  startup.create('hotel', node, [daemonFile], daemonLog)

  console.log(`  Started http://localhost:${conf.port}`)
}

// Stop daemon using killURL
export function stop (cb) {
  got.post(killURL, (err) => {
    console.log(err ? '  Not running' : '  Stopped daemon')

    debug(`removing ${startupFile}`)
    startup.remove('hotel')

    cb()
  })
}
