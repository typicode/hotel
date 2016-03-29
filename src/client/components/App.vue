<template>
  <List></List>
  <Output></Output>
</template>

<script>
import List from './List.vue'
import * as actions from '../actions'

export default {
  components: { List },
  created() {
    this.watchMonitors()
  },
  vuex: {
    actions
  }
}
</script>
