<template>
  <div class="output" v-on:scroll="onScroll">
    <div
      v-for="item in output"
      v-bind:style="{ height: itemHeight + 'px'}"
      track-by="$index"
    >
      {{ item }}
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      scroll: true,
      scrollback: 1000,
      height: 20
    }
  },

  vuex: {
    getters: {
      output: (state) => state.output
    }
  },

  watch: {
    output(now, before) {
      this.$nextTick(() => {
        if (this.scroll) this.$el.scrollTop = this.$el.scrollHeight
      })

      if (now[0] !== before[0]) {
        this.$el.scrollTop -= this.itemHeight
      }
    }
  },

  methods: {
    onScroll(event) {
      var element = event.target
      this.scroll = element.scrollHeight - element.scrollTop === element.clientHeight
    }
  }
}
</script>
