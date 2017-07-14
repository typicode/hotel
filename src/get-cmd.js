const os = require('os')
const unquote = require('unquote')

module.exports = cmd =>
  os.platform() === 'win32'
    ? ['cmd', '/c'].concat(cmd.split(' '))
    : ['sh', '-c'].concat(unquote(cmd))
