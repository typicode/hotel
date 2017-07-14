const tinydate = require('tinydate')
const stamp = tinydate('{HH}:{mm}:{ss}')

module.exports = function log(...args) {
  console.log(stamp(), '-', ...args)
}
