#!/usr/bin/env node
const pkg = require('../../package.json')
require('please-upgrade-node')(pkg)

const updateNotifier = require('update-notifier')
const sudoBlock = require('sudo-block')

sudoBlock('\nShould not be run as root, please retry without sudo.\n')
updateNotifier({ pkg }).notify()
require('./')(process.argv)
