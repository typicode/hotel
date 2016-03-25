<style>
.monitor {
  border-top: 1px solid #EEE;
  height: 40px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.monitor.stopped,
.monitor.crashed {
  color: #bdc3c7;
}

.monitor .status {
  font-size: 12px;
}

</style>

<template>
<div class="monitor {{status}}">
  <div class="details">
    <a href="/{{id}}" :title="title" :target="linkTarget">
      {{id}}<span class="status"> - {{status}}</span>
    </a>
  </div>
  <Sw :on="status === 'running'" @change="change"></Sw>
</div>
</template>

<script>
const API_ROOT = '_'

import Sw from './Switch.vue'

export default {
  props: {
    status: {
      type: String,
      required: true
    },
    id: {
      type: String,
      required: true
    },
    title: {
      type: String
    },
    openInNewWindow: {
      type: Boolean,
      default: false
    }
  },

  computed: {
    linkTarget() {
      return this.openInNewWindow ? '_blank' : ''
    }
  },

  methods: {
    change(status) {
      if (status) {
        this.start(this.id);
      }
      else {
        this.stop(this.id);
      }
    },

    start(id) {
      fetch(`${API_ROOT}/servers/${id}/start`, { method: 'POST' })
    },

    stop(id) {
      fetch(`${API_ROOT}/servers/${id}/stop`, { method: 'POST' })
    }
  },

  components: { Sw }
}

</script>
