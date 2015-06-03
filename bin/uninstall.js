var autostart = require('../lib/actions/autostart')
var daemon = require('../lib/actions/daemon')

console.log()
autostart.remove()
console.log()
daemon.stop(console.log)
