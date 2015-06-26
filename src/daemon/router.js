let util = require('util')
let once = require('once')
let express = require('express')
let onPortOpen = require('../utils/on-port-open')
let conf = require('../conf')
let pkg = require('../../package.json')

module.exports = function (servers) {
  let router = express.Router()

  function kill (req, res) {
    res.end()
    util.log('Shutting down servers')
    servers.shutdown(() => {
      util.log('Exit')
      process.exit()
    })
  }

  function redirect (req, res, next) {
    let id = req.params.id

    if (!servers.has(id)) {
      return res.redirect('/')
    }

    // Start server
    servers.start(id)

    // Redirect when server is available
    let port = servers.get(id).env.PORT
    let hostname = req.hostname
    let timeout = conf.timeout

    let forward = (err) => {
      if (err) {
        let msg = `Can't connect to server on port ${port}`

        msg += `server crashed or timeout of ${timeout}ms exceeded. Retry or check logs.`
        msg += '<pre><code>'
        msg += servers.get(id).command.join(' ')
        msg += '\n\n'
        msg += servers.get(id).tail
        msg += '</code></pre>'

        res.status(502).send(msg)
      } else {
        let url = `http://${hostname}:${port}`
        util.log(`Redirect to ${url}`)
        res.redirect(url)
      }
    }

    // Make sure to send only one response
    forward = once(forward)

    // If server stops, no need to wait for timeout
    servers.get(id).once('stop', () => forward(new Error('Server stopped')))

    // When port is open, forward
    onPortOpen(port, timeout, forward)
  }

  router
    .get('/:id', redirect)
    .post('/kill', kill)

  return router
}
