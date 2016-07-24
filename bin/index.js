#!/usr/bin/env node
var updateNotifier = require('update-notifier')
var sudoBlock = require('sudo-block')
var pkg = require('../package.json')

sudoBlock('\nShould not be run as root, please retry without sudo.\n')
updateNotifier({ pkg: pkg }).notify()
require('../lib/cli')(process.argv)
