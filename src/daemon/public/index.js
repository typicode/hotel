;(function () {
  var $ = window.jQuery
  var io = window.io
  var Handlebars = window.Handlebars

  var source = $('#template').html()
  var template = Handlebars.compile(source)
  var socket = io.connect(window.location.origin)

  $('body')
    .on('click', '.stop', function () {
      var id = $(this).data('id')
      socket.emit('stop', id)
    })
    .on('click', '.start', function () {
      var id = $(this).data('id')
      socket.emit('start', id)
    })

  socket.on('change', function (context) {
    var html = template(context)
    $('#content').html(html)
  })
})()
