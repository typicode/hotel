var sudoBlock = require('sudo-block');
var autostart = require('../lib/actions/autostart')
var daemon = require('../lib/actions/daemon')

// Checking if hotel is being installed using 'sudo npm'
// ~/.hotel should not be created as root
sudoBlock(
'\n' +
'  To complete install, please run:\n' +
'  hotel autostart && hotel start\n'
)

console.log()
autostart.create()
console.log()
daemon.start()
console.log()
console.log('  To uninstall: npm rm -g hotel')
console.log()
