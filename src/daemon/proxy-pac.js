const conf = require('../conf')

// Proxy only *.dev URLs
// Send direct for other domains
module.exports =
`function FindProxyForURL (url, host) {
  if (dnsDomainIs(host, '.dev')) return 'PROXY 127.0.0.1:${conf.port}'
  return 'DIRECT'
}
`
