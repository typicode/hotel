const opener = require('opener')
const conf = require('../conf')
const net = require('net')

module.exports = {
  open
}

function open (cb) {
  const url = `http://localhost:${conf.port}`
  ensureAvailable(conf.port, (err) => {
    if (err) {
      console.log(`  Error   Can't connect to hotel daemon`)
      console.log(`          Use 'hotel start' to start the service`)
      console.log('')
      process.exit(1)
    }

    const proc = opener(url)
    proc.unref()
    cb()
  })
}

function ensureAvailable (port, cb) {
  const client = net.connect({ port }, () => {
    client.destroy()
    cb()
  }).on('error', err => {
    cb(err)
  })
}
