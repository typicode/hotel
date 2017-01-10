const serverReady = require('server-ready')
const stripAnsi = require('strip-ansi')

// Simple error message used in vhosts/dev and router
module.exports = function (err, server) {
  if (server.start) {
    const { PORT } = server.env
    const { timeout } = serverReady
    const command = server.command.join(' ')
    const tail = stripAnsi(server.tail)
    return `
Can't connect to server on PORT=<a href="http://localhost:${PORT}">${PORT}</a>.<br>
Possible causes:
<ul>
  <li>Server crashed or timeout of ${timeout}ms exceeded.</li>
  <li>Server isn't listening on PORT environment variable.</li>
</ul>
Try to reload or check logs.
<pre><code>
${command}

${tail}
</code></pre>`
  }

  return `
Can't proxy request to <a href="${server.target}">${server.target}</a>.
<pre><code>
${err.message}
</code></pre>
`
}
