const conf = require('../../conf')

// Tells the browser to proxy *.dev URLs to hotel
module.exports =
`function FindProxyForURL (url, host) {
  if (dnsDomainIs(host, '.${conf.tld}')) return 'PROXY 127.0.0.1:${conf.port}'
  return 'DIRECT'
}
`
