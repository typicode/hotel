<style>
#log {
  overflow-y: scroll;
  padding: 10px;
  font-family: monospace;
  font-size: 14px;
  word-break: break-all;
  background: #222;
  color: #EEE;
  position: absolute;
  left: 360px;
  right: 0;
  top: 0;
  bottom: 0;
}
</style>

<template>
  <div id="log" v-on:scroll="onScroll">
    <div v-for="item in items" v-bind:style="{ height: itemHeight + 'px'}">
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
    output() {
      this.$nextTick(() => {
        if (this.scroll) this.$el.scrollTop = this.$el.scrollHeight
      })

      if (this.output.length > this.scrollback) {
        this.output.shift()
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
