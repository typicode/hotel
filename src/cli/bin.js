#!/usr/bin/env node
const pkg = require('../../package.json')

// Check Node version compatibility
const nodeVersion = process.versions.node.split('.').map(Number)
const requiredVersion = pkg.engines.node.replace('>=', '').split('.').map(Number)

if (nodeVersion[0] < requiredVersion[0] || 
    (nodeVersion[0] === requiredVersion[0] && nodeVersion[1] < requiredVersion[1])) {
  console.error(`hotel requires Node.js ${pkg.engines.node} or higher`)
  console.error(`Current version: ${process.version}`)
  process.exit(1)
}

try {
  require('please-upgrade-node')(pkg)
} catch (err) {
  // Ignore please-upgrade-node errors - we already checked above
}

const updateNotifier = require('update-notifier')
const sudoBlock = require('sudo-block')

sudoBlock('\nShould not be run as root, please retry without sudo.\n')
updateNotifier({ pkg }).notify()
require('./')(process.argv)
