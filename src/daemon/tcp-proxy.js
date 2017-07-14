const net = require('net')
const log = require('./log')

module.exports = {
  proxy
}

function proxy(source, targetPort, targetHost) {
  const target = net.connect(targetPort)
  source.pipe(target).pipe(source)

  const handleError = err => {
    log('TCP Proxy - Error', err)
    source.destroy()
    target.destroy()
  }

  source.on('error', handleError)
  target.on('error', handleError)

  source.write(
    'HTTP/1.1 200 Connection Established\r\n' +
      'Proxy-agent: Hotel\r\n' +
      '\r\n'
  )

  return target
}
