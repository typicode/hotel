const util = require('util')
const conf = require('../conf')
const servers = require('./server-group')()
const server = require('./app')(servers)

// Start server
server.listen(conf.port, conf.host, function () {
  util.log(`Server listening on port ${conf.host}:${conf.port}`)
})
