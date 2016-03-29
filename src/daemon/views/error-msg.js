const serverReady = require('server-ready')
const stripAnsi = require('strip-ansi')

// Simple error message used in vhosts/dev and router
module.exports = function (server) {
  const { PORT } = server.env
  const { timeout } = serverReady
  const command = server.command.join(' ')
  const tail = stripAnsi(server.tail)

  return `
Can't connect to server on PORT=${PORT}.
Possible causes:
- Server crashed or timeout of ${timeout}ms exceeded.
- Server isn't listening on PORT environment variable.'
Try to reload or check logs.
<pre><code>
${command}

${tail}
</code></pre>
`
}
