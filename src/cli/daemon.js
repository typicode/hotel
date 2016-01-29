const path = require('path')
const http = require('http')
const url = require('url')
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
  const node = process.execPath
  const daemonFile = path.join(__dirname, '../daemon')
  const daemonLog = path.resolve(untildify('~/.hotel/daemon.log'))

  debug(`creating ${startupFile}`)
  startup.create('hotel', node, [daemonFile], daemonLog)

  console.log(`Started http://localhost:${conf.port}`)
}

// Stop daemon using killURL
function stop (cb) {
  const opts = url.parse(killURL)
  opts.method = 'POST'

  const req = http.request(opts, () => {
    debug(`removing ${startupFile}`)
    startup.remove('hotel')
    console.log('Stopped daemon')
    cb()
  })

  req.on('error', () => console.log('Not running'))
}
