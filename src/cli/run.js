const cp = require('child_process')
const getPort = require('get-port')
const servers = require('./servers')
const getCmd = require('../get-cmd')

const signals = ['SIGINT', 'SIGTERM', 'SIGHUP']

module.exports = {
  // For testing purpose, allows stubbing cp.spawnSync
  _spawnSync(...args) {
    cp.spawnSync(...args)
  },

  // For testing purpose, allows stubbing process.exit
  _exit(...args) {
    process.exit(...args)
  },

  spawn(cmd, opts = {}) {
    const cleanAndExit = (code = 0) => {
      servers.rm(opts)
      this._exit(code)
    }

    const startServer = port => {
      const serverAddress = `http://localhost:${port}`

      process.env.PORT = port
      servers.add(serverAddress, opts)

      signals.forEach(signal => process.on(signal, cleanAndExit))

      const [command, ...args] = getCmd(cmd)
      const { status, error } = this._spawnSync(command, args, {
        stdio: 'inherit',
        cwd: process.cwd()
      })

      if (error) throw error
      cleanAndExit(status)
    }

    if (opts.port) {
      startServer(opts.port)
    } else {
      getPort()
        .then(startServer)
        .catch(err => {
          throw err
        })
    }
  }
}
