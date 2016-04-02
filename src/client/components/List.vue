<template>
  <table>
    <tr v-if="monitors.length" v-for="monitor in monitors">

      <td>
        <a
          href="/{{monitor.id}}"
          title="{{monitor.cwd}}$ {{monitor.command[2]}}"
          class="monitor"
          v-bind:class="monitor.status"
        >
          {{monitor.id}}<span class="status"> - {{monitor.status}}</span>
        </a>
      </td>

      <td>
        <a
          class="toggle"
          v-bind:class="isRunning(monitor.status) ? 'on' : 'off'"
          v-on:click.prevent="toggleMonitor(monitor.id, monitor.status)"
        >
          <i
            class="fa"
            v-bind:class="isRunning(monitor.status) ? 'fa-toggle-on' : 'fa-toggle-off'"
          >
          </i>
        </a>
      </td>

      <td>
        <a
          title="logs"
          class="toggle-output"
          v-bind:class="{ selected: isSelected(monitor.id) }"
          v-on:click.prevent="toggleOutput(monitor.id)"
        >
          <i class="fa fa-angle-right"></i>
        </a>
      </td>

    </tr>
  </table>

  <div v-if="!monitors.length">
    <p>Welcome, please enjoy your stay!</p>
    <p><em>Use hotel command-line to add servers</em></p>
  </div>

  <Output class="output" v-show="outputId"><Output>
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
