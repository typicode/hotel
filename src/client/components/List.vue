<style>
.options, .list {
  width: 100%;
  max-width: 320px;
}

.options.monitor {
  border-top: none;
  margin-bottom: 10px;
  font-size: 1em;
}

.empty a {
  text-decoration: underline;
}
</style>

<template>
  <div class="options monitor">
    <div class="status">Open in New Window</div>
    <Sw :on.sync="_openInNewWindow"></Sw>
  </div>

  <div v-if="monitors.length" class="list">
    <Monitor v-for="monitor in monitors" :id="monitor.id"
      :status="monitor.status" :open-in-new-window="openInNewWindow"
      title="{{monitor.cwd}}$ {{monitor.command[2]}}"></Monitor>
  </div>

  <div v-if="!monitors.length" class="empty">
    <p>Welcome (^_^)</p>
    <p><em>Use hotel command-line to add servers</em></p>
  </div>
</template>

<script>
const API_ROOT = '_'

import Sw from './Switch.vue'
import Monitor from './Monitor.vue'

export default {
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

  data() {
    return {
      monitors: [],
      openInNewWindow: false
    }
  },

  computed: {
    _openInNewWindow: {
      get() {
        if (window.localStorage) {
          this.openInNewWindow = window.localStorage.getItem('openInNewWindow') == 'true'
        }
        return this.openInNewWindow
      },
      set(newVal) {
        this.openInNewWindow = newVal
        if (window.localStorage) {
          window.localStorage.setItem('openInNewWindow', newVal)
        }
      }
    }
  },

  components: { Monitor, Sw }
}
</script>
