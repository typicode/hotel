var http = require('http')

http
  .createServer(function(req, res) {
    console.log(req.headers)
    res.writeHead(200, { 'Content-Type': 'text/plain' })
    res.end(
      [
        'Hello World',
        process.env.FOO,
        process.env.HTTP_PROXY,
        'x-forwarded-host: ' + req.headers['x-forwarded-host'],
        'host: ' + req.headers.host
      ].join(' ')
    )
  })
  .listen(process.env.PORT, '127.0.0.1')

console.log('Server listening on port', process.env.PORT)
