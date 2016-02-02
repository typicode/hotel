/* eslint-disable */
;(function () {
  const API_ROOT = '_'

  const vm = new Vue({

    el: '#app',

    created() {
      if (EventSource) {
        new EventSource(`${API_ROOT}/events`).onmessage = event => {
          const data = JSON.parse(event.data)
          this.monitors = data.monitors
        }
      } else {
        setInterval(() => {
          fetch(`${API_ROOT}/servers`)
            .then(response => response.json())
            .then(json => this.monitors = json)
        }, 1000)
      }
    },

    data: {
      monitors: null
    },

    methods: {
      start(id) {
        fetch(`${API_ROOT}/servers/${id}/start`, { method: 'POST' })
      },

      stop: function (id) {
        fetch(`${API_ROOT}/servers/${id}/stop`, { method: 'POST' })
      }
    }
  })
})()
