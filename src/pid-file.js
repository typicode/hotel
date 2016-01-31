const fs = require('fs')
const untildify = require('untildify')
const pidFile = untildify('~/.hotel/pid')

module.exports = {
  create,
  read,
  remove
}

function create () {
  return fs.writeFileSync(pidFile, process.pid)
}

function read () {
  if (fs.existsSync(pidFile)) {
    return fs.readFileSync(pidFile, 'utf-8')
  }
}

function remove () {
  if (fs.existsSync(pidFile)) {
    fs.unlinkSync(pidFile)
  }
}
