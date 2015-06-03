#!/usr/bin/env node
var fs = require('fs')
var path = require('path')
var tildify = require('tildify')
var updateNotifier = require('update-notifier')
var servers = require('../lib/actions/servers')
var daemon = require('../lib/actions/daemon')
var autostart = require('../lib/actions/autostart')
var pkg = require('../package.json')

updateNotifier({pkg: pkg}).notify()

var yargs = require('yargs')
  .usage('Usage: $0 <command> [options]')
  .command('add [-n name] [-o file] [-e env] <cmd>', 'Add server')
  .command('rm [name]', 'Remove server')
  .command('ls', 'List servers')
  .command('start', 'Start daemon')
  .command('stop', 'Stop daemon')
  .command('autostart', 'Create autostart script')
  .command('rm-autostart', 'Remove autostart script')
  .alias('h', 'help')
  .example('$0 add nodemon')
  .example('$0 add -o app.log \'serve -p $PORT\'')
  .example('$0 add -n app \'serve -p $PORT\'')
  .example('$0 add -e PATH \'serve -p $PORT\'')
  .epilog('https://github.com/typicode/hotel')
  .demand(1)

var argv = yargs.argv
var _ = argv._

function run () {
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

  if (_[0] === 'autostart') {
    return autostart.create()
  }

  if (_[0] === 'rm-autostart') {
    return autostart.remove()
  }

  yargs.showHelp()
}

console.log()
run()
console.log()
