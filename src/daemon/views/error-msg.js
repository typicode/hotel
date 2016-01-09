const serverReady = require('server-ready')
const stripAnsi = require('strip-ansi')

// Simple error message used in vhosts/dev and router
module.exports = function (server) {
  const { PORT } = server.env
  const { timeout } = serverReady
  const command = server.command.join(' ')
  const tail = stripAnsi(server.tail)

  let msg = `Can't connect to server on port ${PORT}.\n`
  msg += `Server crashed or timeout of ${timeout}ms exceeded. Retry or check logs.\n`
  msg += '<pre><code>'
  msg += command
  msg += '\n\n'
  msg += tail
  msg += '</code></pre>'

  return msg
}
