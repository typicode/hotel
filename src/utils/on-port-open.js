let net = require('net')

export default function (port, timeout, cb) {
  let start = new Date()

  // Recursive connect function limited by timeout
  let connect = (port, cb) => {
    let client = net.connect({ port })

      // On connect, destroy client
      .on('connect', () => {
        client.destroy()
        cb()
      })

      // On error,
      .on('error', () => {
        client.destroy()
      })

      // On close, retry once after a second
      .once('close', () => {
        if (new Date() - start > timeout) {
          cb(new Error('Timeout'))
        } else {
          setTimeout(() => connect(port, cb), 250)
        }
      })

  }

  connect(port, cb)
}
