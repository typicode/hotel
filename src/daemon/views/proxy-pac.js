const conf = require('../../conf')

// Proxy only *.tld requests to hotel (.dev by default)
// Send direct all other traffic
const simple =
`function FindProxyForURL (url, host) {
  if (dnsDomainIs(host, '.${conf.tld}')) {
    return 'PROXY 127.0.0.1:${conf.port}';
  }

  return 'DIRECT';
}
`

// Same as above, except that it lets you use hotel behind a corporate proxy.
// Set conf.proxy in ~/.hotel/conf.json to your proxy address and port.
// For example: { "proxy": "1.2.3.4:5000" }
//
// See also https://en.wikipedia.org/wiki/Private_network
const withProxy =
`function FindProxyForURL (url, host) {
  if (dnsDomainIs(host, '.${conf.tld}')) {
    return 'PROXY 127.0.0.1:${conf.port}';
  }

  var address = dnsResolve(host);
  if (
    isPlainHostName(host) ||
    dnsDomainIs(host, '.local') ||
    isInNet(address, '10.0.0.0', '255.0.0.0') ||
    isInNet(address, '172.16.0.0',  '255.240.0.0') ||
    isInNet(address, '192.168.0.0',  '255.255.0.0') ||
    isInNet(address, '127.0.0.0', '255.255.255.0')
  ) {
    return 'DIRECT';
  }

  return 'PROXY ${conf.proxy}';
}
`

module.exports = conf.proxy ? withProxy : simple
