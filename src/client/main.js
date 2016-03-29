const Vue = require('vue')
const App = require('./components/App.vue')
const store = require('./store')

Vue.config.debug = true

/* eslint-disable no-new */
new Vue({
  el: 'body',
  store,
  components: {
    app: App
  }
})
