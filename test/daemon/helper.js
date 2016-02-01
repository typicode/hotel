const regroup = require('respawn-group')
const daemonApp = require('../../src/daemon/app')

module.exports.createApp = function () {
  const group = regroup()

  group.add('node', ['node', 'index.js'], {
    cwd: `${__dirname}/../fixtures/app`,
    env: { PORT: 51234 },
    stdio: 'inherit'
  })

  group.add('failing', ['foo'])

  const app = daemonApp(group)
  app.group = group
  app.shutdown = cb => group.shutdown(cb)
  return app
}
