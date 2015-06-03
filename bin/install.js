var autostart = require('../lib/actions/autostart')
var daemon = require('../lib/actions/daemon')

console.log()

autostart.create()

console.log()

daemon.start()

console.log()
console.log('  To uninstall: npm rm -g hotel')
console.log('')
