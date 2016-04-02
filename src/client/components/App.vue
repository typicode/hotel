<template>
  <List></List>
  
  <footer>
    <p>
      <a href="https://github.com/typicode/hotel">
        <i class="fa fa-building-o"></i> <span>README</span>
      </a>
    </p>
  </footer>
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
