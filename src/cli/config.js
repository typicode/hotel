const fs = require('fs')
const path = require('path')

function getArgv () {
  const file = path.join(process.cwd(), '.hotelrc')
  if (!fs.existsSync(file)) {
    return
  }

  const data = fs.readFileSync(file)
  const config = JSON.parse(data)

  const { cmd, url } = config
  const arg = cmd || url

  const argv = [ arg ]

  if (config.out) {
    argv.push('--out', config.out)
  }

  if (config.port) {
    argv.push('--port', config.port)
  }

  return argv
}

module.exports = getArgv
