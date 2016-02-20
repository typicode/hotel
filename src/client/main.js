const Vue = require('vue')
const App = require('./components/App.vue')

/* eslint-disable no-new */
new Vue({
  el: 'body',
  components: {
    app: App
  }
})
