const Vue = require('vue')
const App = require('./components/App.vue')

// Vue.config.debug = true;

/* eslint-disable no-new */
new Vue({
  el: 'body',
  components: {
    app: App
  }
})
