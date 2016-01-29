/* eslint-disable */
;(function () {
  var vm = new Vue({

    el: '#app',

    created: function () {
      var self = this
      if (EvenetSource) {
        new EventSource('/_api/events').onmessage = function (event) {
          var data = JSON.parse(event.data)
          self.monitors = data.monitors
        }
      } else {
        setInterval(() => fetch('/_api/servers')
          .then(response => response.json())
          .then(json => self.monitors = json)
        , 1000)
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
