#!/usr/bin/env node
const upgradeNode = require('please-upgrade-node')
const sudoBlock = require('sudo-block')
const pkg = require('../../package.json')

sudoBlock('\nShould not be run as root, please retry without sudo.\n')
upgradeNode({ pkg })
require('./')(process.argv)
