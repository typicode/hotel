const cp = require('child_process')
const getPort = require('get-port')
const servers = require('./servers')
const getCmd = require('../get-cmd')

const signals = [ 'SIGINT', 'SIGTERM', 'SIGHUP' ]

module.exports.spawn = (cmd, opts = {}, cb) => {
  const startServer = (port) => {
    const serverAddress = `http://localhost:${port}`

    process.env.PORT = port
    servers.add(serverAddress, opts)

    const [command, ...args] = getCmd(cmd)
    const child = cp.spawn(command, args, {
      stdio: 'inherit',
      cwd: process.cwd()
    })

    signals.forEach((sig) => {
      process.on(sig, () => {
        child.kill(sig)
      })
    })

    child.on('exit', (code) => {
      servers.rm(opts)
      process.exit(code)
    })

    child.on('error', (err) => {
      servers.rm(opts)
      if (err) throw err
    })

    cb(child)
  }

  if (opts.port) {
    startServer(opts.port)
  } else {
    getPort()
      .then(startServer)
      .catch(err => { throw err })
  }
}
