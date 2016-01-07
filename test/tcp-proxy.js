const net = require('net')
const assert = require('assert')
const tcpProxy = require('../src/daemon/tcp-proxy')

const PORT = 23000
const MSG = 'Hello'

const expected =
  'HTTP/1.1 200 Connection Established\r\n' +
  'Proxy-agent: Hotel\r\n' +
  '\r\n' +
  MSG

const server = net.createServer((socket) => {
  socket.on('data', (buffer) => socket.write(buffer))
})

server.listen(PORT, () => {
  const client = new net.Socket().connect(PORT)

  var data = ''

  client.on('data', (buffer) => {
    data += buffer.toString()
  })

  client.on('end', () => {
    server.close()
    assert.equal(data, expected)
  })

  tcpProxy(client, PORT).on('close', () => {
    console.log('closed')
  })

  client.end(MSG)
})
