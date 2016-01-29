/* eslint-disable */
;(function () {
  var vm = new Vue({

    el: '#app',

    created: function () {
      var self = this
      if (EventSource) {
        new EventSource('/_api/events').onmessage = function (event) {
          var data = JSON.parse(event.data)
          self.monitors = data.monitors
        }
      } else {
        setInterval(function () {
          fetch('/_api/servers')
            .then(function (response) {
              return response.json()
            })
            .then(function (json) {
              return self.monitors = json
            })
        }, 1000)
      }
    },

    data: {
      monitors: null
    },

    methods: {
      start: function (id) {
        fetch('/_api/servers/' + id + '/start', { method: 'POST' })
      },

      stop: function (id) {
        fetch('/_api/servers/' + id + '/stop', { method: 'POST' })
      }
    }
  })
})()
