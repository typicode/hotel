const path = require('path')
const cp = require('child_process')

let child

function start() {
  if (child) stop()

  child = cp.fork(path.join(__dirname, 'daemon.js'))
  child.on('message', message => {
    console.log('Parent process got message:', message)
    switch (message.command) {
      case 'die':
        console.log('Killing daemon...')
        stop()
        break
      case 'restart':
        console.log('Reloading daemon...')
        stop()
        start()
        break
      default:
        console.error('Command', message.command, 'unrecognized')
    }
  })
}

function stop() {
  if (!child) return

  child.kill()

  child = null
}

start()
