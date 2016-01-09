;(function () {
  var $ = window.jQuery
  var Handlebars = window.Handlebars

  var source = $('#template').html()
  var template = Handlebars.compile(source)

  $('body')
    .on('click', '.stop', function () {
      var id = $(this).data('id')
      $.post('/_servers/' + id + '/stop')
    })
    .on('click', '.start', function () {
      var id = $(this).data('id')
      $.post('/_servers/' + id + '/start')
    })

  /* global EventSource */
  console.log('foo')
  new EventSource('/_events').onmessage = function (event) {
    console.log(event)
    var html = template(JSON.parse(event.data))
    $('#content').html(html)
  }
})()
