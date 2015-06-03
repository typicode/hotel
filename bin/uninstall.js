var autostart = require('../lib/actions/autostart')
var daemon = require('../lib/actions/daemon')

daemon.stop()
autostart.remove()
