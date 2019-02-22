const path = require('path')
const homedir = require('os').homedir()

const hotelDir = path.join(homedir, '.hotel')

module.exports = {
  hotelDir,

  get confFile() {
    return path.join(this.hotelDir, 'conf.json')
  },

  get serversDir() {
    return path.join(this.hotelDir, 'servers')
  },

  get pidFile() {
    return path.join(this.hotelDir, 'daemon.pid')
  },

  get logFile() {
    return path.join(this.hotelDir, 'daemon.log')
  },

  get startupFile() {
    return path.join(this.hotelDir, 'startup')
  }
}
