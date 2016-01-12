/* global EventSource, Vue, fetch */
;(function () {
  new Vue({

    el: '#app',

    created: function () {
      var self = this
      new EventSource('/_events').onmessage = function (event) {
        var data = JSON.parse(event.data)
        self.monitors = data.monitors
      }
    },

    data: {
      monitors: null
    },

    methods: {
      start: function (id) {
        fetch('/_servers/' + id + '/start', { method: 'POST' })
      },

      stop: function (id) {
        fetch('/_servers/' + id + '/stop', { method: 'POST' })
      }
    }
  })
})()
