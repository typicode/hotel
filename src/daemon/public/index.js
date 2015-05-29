let source = $("#template").html()
let template = Handlebars.compile(source)
let socket = io.connect(location.origin)

$('body')
  .on('click', '.stop', () => {
    let id = $(this).data('id')
    socket.emit('stop', id)
  })
  .on('click', '.start', () => {
    let id = $(this).data('id')
    socket.emit('start', id)
  })

socket.on('change', (context) => {
  let html = template(context)
  $('#content').html(html)
})
