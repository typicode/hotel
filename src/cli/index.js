const updateNotifier = require('update-notifier')
const sudoBlock = require('sudo-block')
const servers = require('./servers')
const daemon = require('./daemon')
const pkg = require('../../package.json')

module.exports = (processArgv) => {
  sudoBlock('\nShould not be run as root, please retry without sudo.\n')
  updateNotifier({ pkg }).notify()

  const yargs = require('yargs')(processArgv.slice(2))
    .version(pkg.version).alias('v', 'version')
    .help('help').alias('h', 'help')
    .usage('Usage: $0 <command> [options]')
    .command('add [-n name] [-o file] [-e env] [-p port] <cmd>', 'Add server')
    .command('rm [name]', 'Remove server').alias('remove', 'rm')
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

  if (_[0] === 'add' && _[1]) {
    return servers.add(_[1], argv)
  }

  if (_[0] === 'rm') {
    return servers.rm(_[1])
  }

  if (_[0] === 'ls') {
    return servers.ls()
  }

  if (_[0] === 'start') {
    return daemon.start()
  }

  if (_[0] === 'stop') {
    return daemon.stop()
  }

  yargs.showHelp()
}
