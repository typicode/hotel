var downgradeRoot = require('downgrade-root');
var autostart = require('../lib/actions/autostart')
var daemon = require('../lib/actions/daemon')

console.log()
try {
  downgradeRoot()
} catch (err) {
  console.log('  Error: Couldn\'t downgrade permissions')
  console.log('  Please run: hotel autostart && hotal start')
  console.log()
  return
}
autostart.create()
console.log()
daemon.start()
console.log()
console.log('  To uninstall: npm rm -g hotel')
console.log('')
