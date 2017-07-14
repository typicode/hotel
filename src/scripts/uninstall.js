const fs = require('fs')
const { startupFile, pidFile } = require('../common')

function killProcess() {
  if (!fs.existsSync(pidFile)) return

  const pid = fs.readFileSync(pidFile, 'utf-8')
  try {
    process.kill(pid)
  } catch (err) {}

  fs.unlinkSync(pidFile)
}

function removeStartup() {
  if (!fs.existsSync(startupFile)) return
  const startupFilePath = fs.readFileSync(startupFile, 'utf-8')
  fs.unlinkSync(startupFile)

  if (!fs.existsSync(startupFilePath)) return
  fs.unlinkSync(startupFilePath)
}

module.exports = () => {
  killProcess()
  removeStartup()
}
