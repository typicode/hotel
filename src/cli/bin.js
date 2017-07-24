#!/usr/bin/env node
require('please-upgrade-node')('..')
const updateNotifier = require('update-notifier')
const sudoBlock = require('sudo-block')
const pkg = require('../../package.json')

sudoBlock('\nShould not be run as root, please retry without sudo.\n')
updateNotifier({ pkg }).notify()
require('./')(process.argv)
