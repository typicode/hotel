<style>
.switch {
  width: 30px;
  font-size: 20px;
}
.switch .stop {
  color: #2ecc71;
}
.switch .stop:hover {
  color: #27ae60;
}
</style>

<template>
<div class="switch">
  <a v-if="!on" @click.prevent="change" class="start">
    <i class="fa fa-toggle-off"></i>
  </a>
  <a v-if="on" @click.prevent="change" class="stop">
    <i class="fa fa-toggle-on"></i>
  </a>
</div>
</template>

<script>

export default {
  props: {
    on: {
      type: Boolean,
      default: false
    }
  },
  methods: {
    change() {
      this.on = !this.on
      this.$emit('change', this.on)
    }
  }
}

</script>
