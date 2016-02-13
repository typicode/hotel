<style>
table {
  width: 100%;
  max-width: 320px;
  border-collapse: collapse;
}

tr {
  border: solid #EEE;
  border-width: 1px 0 1px 0;
  vertical-align: middle;
  height: 40px;
}

td.actions {
  width: 30px;
  text-align: right;
  font-size: 18px;
}

td.actions .fa {
  font-size: 20px;
}

.status {
  font-size: 12px;
}

tr.stopped, tr.crashed {
  color: #bdc3c7;
}

tr.running td.actions a {
  color: #2ecc71 !important;
}

tr.running td.actions a:hover {
  color: #27ae60 !important;
}

.empty a {
  text-decoration: underline;
}
</style>

<template>
  <table>
    <tr v-if="monitors.length" v-for="monitor in monitors" class="monitor {{monitor.status}}">

      <td class="details">
        <a href="/{{monitor.id}}" title="{{monitor.cwd}}$ {{monitor.command[2]}}">
          {{monitor.id}}<span class="status"> - {{monitor.status}}</span>
        </a>
      </td>

      <td class="actions">
        <a v-if="monitor.status !== 'running'" v-on:click.prevent="start(monitor.id)" class="start">
          <i class="fa fa-toggle-off"></i>
        </a>
        <a v-if="monitor.status === 'running'" v-on:click.prevent="stop(monitor.id)" class="stop">
          <i class="fa fa-toggle-on"></i>
        </a>
      </td>

    </tr>
  </table>

  <div v-if="!monitors.length" class="empty">
    <p>Welcome (^_^)</p>
    <p><em>Use hotel command-line to add servers</em></p>
  </div>
</template>

<script>
const API_ROOT = '_'

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
      monitors: null
    }
  },

  methods: {
    start(id) {
      fetch(`${API_ROOT}/servers/${id}/start`, { method: 'POST' })
    },

    stop: function (id) {
      fetch(`${API_ROOT}/servers/${id}/stop`, { method: 'POST' })
    }
  }
}
</script>
