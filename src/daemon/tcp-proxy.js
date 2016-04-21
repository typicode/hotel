const net = require('net')
const util = require('util')

module.exports = (source, targetPort) => {
  const target = net.connect(targetPort)
  source.pipe(target).pipe(source)

  const handleError = (err) => {
    util.log(err)
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
