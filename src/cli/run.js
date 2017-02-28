const cp = require('child_process')
const getPort = require('get-port')
const exitHook = require('exit-hook')
const servers = require('./servers')
const getCmd = require('../get-cmd')

const signals = [ 'SIGINT', 'SIGTERM', 'SIGHUP' ]

module.exports = {
  spawn
}

function spawn (cmd, opts = {}) {
  const exit = (code = 0) => {
    servers.rm(opts)
    process.exit(code)
  }

  const startServer = (port) => {
    const serverAddress = `http://localhost:${port}`

    process.env.PORT = port
    servers.add(serverAddress, opts)

    process.on('SIGTERM', exit)
    process.on('SIGINT', exit)
    process.on('SIGHUP', exit)

    const [command, ...args] = getCmd(cmd)
    const { status, error } = cp.spawnSync(command, args, {
      stdio: 'inherit',
      cwd: process.cwd()
    })

    if (error) throw error
    exit(status)
  }

  if (opts.port) {
    startServer(opts.port)
  } else {
    getPort()
      .then(startServer)
      .catch(err => { throw err })
  }
}
