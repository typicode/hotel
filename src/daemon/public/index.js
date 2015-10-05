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
    }).on('click', '.remove', function () {
      var sure = confirm('Are you sure?');
      if(sure){
        var id = $(this).data('id');
        socket.emit('remove', id);
      }
    }).on('click', '.add', function () {
      var name = prompt('Name?');
      if(name){
        var path = prompt('Path?');
        if(path){
          var cmd =  prompt('Cmd?');
          if(cmd){
            socket.emit('add', {name: name, path: path, cmd: cmd});
          }
        }
      }
    })

  socket.on('change', function (context) {
    var html = template(context)
    $('#content').html(html)
  })
})()
