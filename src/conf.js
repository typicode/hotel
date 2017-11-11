const conf = require('./raw-conf')

// Defaults
const defaults = {
  port: 2000,
  host: '127.0.0.1',
  timeout: 5000,
  tld: 'dev',
  // Replace with your network proxy IP (1.2.3.4:5000) if any
  // For example, if you're behind a corporate proxy
  proxy: false
}

// Assign defaults and export
module.exports = { ...defaults, ...conf }
