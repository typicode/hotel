<template>
  <div v-on:scroll="onScroll">
    <div v-for="item in output" track-by="_uid">
      {{ item.line }}
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
      outputId: (state) => state.outputId,
      output: (state) => state.output
    }
  },

  watch: {
    output(now, before) {
      this.$nextTick(() => {
        // keep scroll at the bottom if it already is
        if (this.scroll) this.$el.scrollTop = this.$el.scrollHeight
      })
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
