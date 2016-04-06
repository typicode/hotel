const conf = require('../../conf')

// Tells the browser to proxy *.dev URLs to hotel
module.exports =
`function FindProxyForURL (url, host) {
  var proxy = '${process.env.http_proxy}';
  if (dnsDomainIs(host, '.${conf.tld}'))
    return 'PROXY 127.0.0.1:${conf.port}'
  if (proxy != null && proxy.trim() != "") {
      if (host == "127.0.0.1"
        || host == "localhost"
        || isInNet(dnsResolve(host), "10.0.0.0", "255.0.0.0")
        || isInNet(dnsResolve(host), "192.168.0.0", "255.255.0.0")) {
        return 'DIRECT'
      }
      return 'PROXY ' + proxy
  } else {
    return 'DIRECT'
  }
}
`
