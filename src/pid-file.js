const fs = require('fs')
const { pidFile } = require('./common')

module.exports = {
  create,
  read,
  remove
}

function create() {
  console.log('create', pidFile, process.pid)
  return fs.writeFileSync(pidFile, `${process.pid}`)
}

function read() {
  if (fs.existsSync(pidFile)) {
    return fs.readFileSync(pidFile, 'utf-8')
  }
}

function remove() {
  if (fs.existsSync(pidFile)) {
    fs.unlinkSync(pidFile)
  }
}
