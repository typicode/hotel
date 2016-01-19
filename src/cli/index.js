const updateNotifier = require('update-notifier')
const sudoBlock = require('sudo-block')
const servers = require('./servers')
const daemon = require('./daemon')
const pkg = require('../../package.json')

module.exports = processArgv => {
  console.log()
  sudoBlock('\n  Should not be run as root, please retry without sudo.\n')
  updateNotifier({ pkg }).notify()

  const yargs = require('yargs')(processArgv.slice(2))
    .version(pkg.version).alias('v', 'version')
    .help('help').alias('h', 'help')
    .usage('Usage: $0 <command> [options]')
    .command('add [-n name] [-o file] [-e env] [-p port] <cmd>', 'Add server')
    .command('rm [name]', 'Remove server')
    .command('ls', 'List servers')
    .command('start', 'Start daemon')
    .command('stop', 'Stop daemon')
    .example('$0 add nodemon')
    .example('$0 add -o app.log \'serve -p $PORT\'')
    .example('$0 add -n app \'serve -p $PORT\'')
    .example('$0 add -e PATH \'serve -p $PORT\'')
    .epilog('https://github.com/typicode/hotel')
    .demand(1)

  const { argv } = yargs
  const { _ } = argv

  // Need to rely on a callback because daemon.stop is asynchronous
  const run = cb => {
    if (_[0] === 'add' && _[1]) {
      servers.add(_[1], argv)
      return cb()
    }

    if (_[0] === 'rm') {
      servers.rm(_[1])
      return cb()
    }

    if (_[0] === 'ls') {
      servers.ls()
      return cb()
    }

    if (_[0] === 'start') {
      daemon.start()
      return cb()
    }

    if (_[0] === 'stop') {
      daemon.stop(cb)
      return
    }

    yargs.showHelp()
  }

  run(err => {
    if (err) {
      if (err.message) console.log('  Error   ' + err.message)
      console.log()
      process.exit(1)
    }
    console.log()
  })
}
