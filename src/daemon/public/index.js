;(function () {
  var $ = window.jQuery
  var Handlebars = window.Handlebars

  var source = $('#template').html()
  var template = Handlebars.compile(source)

  $('body')
    .on('click', '.stop', function () {
      var id = $(this).data('id')
      $.ajax('/_/' + id, {
        method: 'PATCH',
        data: { action: 'stop' }
      })
    })
    .on('click', '.start', function () {
      var id = $(this).data('id')
      $.ajax('/_/' + id, {
        method: 'PATCH',
        data: { action: 'start' }
      })
    })


  var es = new EventSource('/_events/servers')
  es.onmessage = function (event) {
    var html = template(JSON.parse(event.data))
    $('#content').html(html)
  }
})()
