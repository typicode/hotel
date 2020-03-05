const path = require('path')
const homedir = require('os').homedir()

const chaletDir = path.join(homedir, '.chalet')

module.exports = {
  chaletDir,
  confFile: path.join(chaletDir, 'conf.json'),
  serversDir: path.join(chaletDir, 'servers'),
  pidFile: path.join(chaletDir, 'daemon.pid'),
  logFile: path.join(chaletDir, 'daemon.log'),
  startupFile: path.join(chaletDir, 'startup')
}
