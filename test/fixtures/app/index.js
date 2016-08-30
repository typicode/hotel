var http = require('http')

var port = process.env.PORT
var host = process.env.HOST || '127.0.0.1'

http.createServer(function (req, res) {
  res.writeHead(200, {'Content-Type': 'text/plain'})
  res.end([
    'Hello World',
    process.env.FOO,
    process.env.PATH
  ].join('/n'))
}).listen(port, host)

console.log('Server running on port:', port, 'host:', host)
