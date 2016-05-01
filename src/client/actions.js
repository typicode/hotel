/* global fetch, EventSource */
const API_ROOT = '/_'

module.exports = {
  startMonitor,
  stopMonitor,
  watchMonitors,
  watchOutput,
  unwatchOutput
}

function startMonitor (store, id) {
  fetch(`${API_ROOT}/servers/${id}/start`, { method: 'POST' })
}

function stopMonitor (store, id) {
  fetch(`${API_ROOT}/servers/${id}/stop`, { method: 'POST' })
}

function watchMonitors ({ dispatch }) {
  if (window.EventSource) {
    new EventSource(`${API_ROOT}/events`).onmessage = event => {
      const data = JSON.parse(event.data)
      dispatch('SET_MONITORS', data.monitors)
    }
  } else {
    setInterval(() => {
      fetch(`${API_ROOT}/events`)
        .then(response => response.json())
        .then(data => dispatch('SET_MONITORS', data.monitors))
    }, 1000)
  }
}

let eventSource
function watchOutput ({ dispatch }, id) {
  eventSource && eventSource.close()
  dispatch('WATCH_OUTPUT', id)

  if (window.EventSource) {
    eventSource = new EventSource(`${API_ROOT}/events/output/${id}`)
    eventSource.onmessage = (event) => {
      JSON
        .parse(event.data)
        .output
        .split('\n')
        .forEach((line) => dispatch('PUSH_OUTPUT', line))
    }
  } else {
    dispatch('PUSH_OUTPUT', 'Sorry, server logs aren\'t supported on this browser :(')
  }
}

function unwatchOutput ({ dispatch }, id) {
  eventSource && eventSource.close()
  dispatch('UNWATCH_OUTPUT')
}
