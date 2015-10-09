;(function () {
  var $ = window.jQuery

  var io = window.io
  var socket = io.connect(window.location.origin)

  var Handlebars = window.Handlebars
  var listTemplate = $('#list-template').html()
  var makeList = Handlebars.compile(listTemplate)

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
      var form = $('#addform')
      if (form.hasClass('show')) {
        var data = {}
        $('input', '#addform').each(function () {
          data[this.name] = this.value
        })
        if (data.cwd && data.cmd) {
          if (!data.n) {
            var split = data.cwd.split('/')
            if (split.length === 1) {
              split = data.cwd.split('\\')
            }
            while (!data.n) {
              data.n = split.pop()
            }
          }
          socket.emit('add', data)
        }
        form.removeClass('show')
        $('.hide').hide()
      } else {
        form.addClass('show')
        $('.hide').show()
      }
    })
    // HIDE
    .on('click', '.hide', function () {
      $('#addform').removeClass('show')
      $('.hide').hide()
    })

  socket.on('change', function (data) {
    var newList = makeList(data)
    $('#list').html(newList)
    $('#vs').text('hotel ' + data.vs)
  })

})()
