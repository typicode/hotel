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

td.action {
  width: 30px;
  text-align: right;
  font-size: 16px;
}

td.action .fa {
  font-size: 20px;
}

.status {
  font-size: 12px;
}

.stopped, .crashed {
  color: #bdc3c7;
}

.active {
  color: #2ecc71 !important;
}

a:hover {
  color: #27ae60 !important;
}
</style>

<template>
  <table>
    <tr v-if="monitors.length" v-for="monitor in monitors">

      <td class="details">
        <a
          href="/{{monitor.id}}"
          title="{{monitor.cwd}}$ {{monitor.command[2]}}"
          class="monitor"
          v-bind:class="{ active: isRunning(monitor.status)}"
        >
          {{monitor.id}}<span class="status"> - {{monitor.status}}</span>
        </a>
      </td>

      <td class="actions">
        <a
          class="output"
          v-bind:class="{ active: isSelected(monitor.id) }"
          v-on:click.prevent="toggleOutput(monitor.id)"
        >
          <i class="fa fa-eye"></i>
        </a>
      </td>

      <td class="actions">
        <a
          class="control"
          v-bind:class="[isRunning(monitor.id) ? 'stop' : 'start']"
          v-on:click.prevent="toggleMonitor(monitor.id, monitor.status)"
        >
          <i v-bind:class="['fa', isRunning(monitor.id) ? 'fa-toggle-on' : 'fa-toggle-off']"></i>
        </a>
      </td>

    </tr>
  </table>

  <div v-if="!monitors.length">
    <p>Welcome, please enjoy your stay!</p>
    <p><em>Use hotel command-line to add servers</em></p>
  </div>

  <Output v-show="outputId"><Output>
</template>

<script>
import Output from './Output.vue'
import * as actions from '../actions'

export default {
  components: { Output },

  vuex: {
    getters: {
      monitors: (state) => state.monitors,
      outputId: (state) => state.outputId
    },
    actions
  },

  methods: {
    isSelected(id) {
      return id === this.outputId
    },

    isRunning(status) {
      return status === 'running'
    },

    toggleOutput(id) {
      this.isSelected(id)
        ? this.unwatchOutput()
        : this.watchOutput(id)
    },

    toggleMonitor(id, status) {
      this.isRunning(status)
        ? this.stopMonitor(id)
        : this.startMonitor(id)
    }
  }
}
</script>
