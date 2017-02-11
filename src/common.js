const path = require('path')
const homedir = require('os').homedir()

const hotelDir = path.join(homedir, '.hotel')

module.exports = {
  hotelDir,
  confFile: path.join(hotelDir, 'conf.json'),
  serversDir: path.join(hotelDir, 'servers'),
  pidFile: path.join(hotelDir, 'daemon.pid'),
  logFile: path.join(hotelDir, 'daemon.log'),
  startupFile: path.join(hotelDir, 'startup')
}
