;(function () {
  var $ = window.jQuery

  var io = window.io
  var socket = io.connect(window.location.origin)

  var Handlebars = window.Handlebars
  var source = $('#list-template').html()
  var template = Handlebars.compile(source)

  $('body')
    // STOP
    .on('click', '.stop', function () {
      var id = $(this).data('id')
      socket.emit('stop', id)
    })
    // START
    .on('click', '.start', function () {
      var id = $(this).data('id')
      socket.emit('start', id)
    })
    // REMOVE
    .on('click', '.remove', function () {
      var sure = window.confirm('Are you sure?')
      if (sure) {
        var id = $(this).data('id')
        socket.emit('remove', id)
      }
    })
    // ADD
    .on('click', '.add', function () {
      var form = $('.addform')
      form.toggleClass('show')
      if (!form.hasClass('show')) {
        var data = {}
        $('input', '.addform').each(function () {
          data[this.name] = this.value
        })
        if (data.path && data.cmd) {
          if (!data.n) {
            var split = data.path.split('/')
            if (split.length === 1) {
              split = data.path.split('\\')
            }
            while (!data.n) {
              data.n = split.pop()
            }
          }
          socket.emit('add', data)
        }
      } else {
        $('input', '.addform').val('')
      }

    })

  socket.on('change', function (context) {
    var newList = template(context)
    $('#list').html(newList)
  })

})()
