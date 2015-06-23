#!/usr/bin/env node
var updateNotifier = require('update-notifier')
var sudoBlock = require('sudo-block')
var servers = require('../lib/actions/servers')
var daemon = require('../lib/actions/daemon')
var autostart = require('../lib/actions/autostart')
var pkg = require('../package.json')

sudoBlock('\n  Should not be run as root, please retry without sudo.\n')

updateNotifier({pkg: pkg}).notify()

var yargs = require('yargs')
  .version(pkg.version).alias('v', 'version')
  .help('help').alias('h', 'help')
  .usage('Usage: $0 <command> [options]')
  .command('add [-n name] [-o file] [-e env] <cmd>', 'Add server')
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

var argv = yargs.argv
var _ = argv._

// Need to rely on a callback because daemon.stop is asynchronous
function run (cb) {
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
    autostart.create()
    console.log()
    daemon.start()
    return cb()
  }

  if (_[0] === 'stop') {
    // Asynchronous command
    autostart.remove()
    console.log()
    daemon.stop(cb)
    return
  }

  yargs.showHelp()
}

console.log()
run(console.log)
