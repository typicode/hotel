const Vue = require('vue')
const App = require('./components/App.vue')
const store = require('./store')

require('font-awesome/css/font-awesome.css')
require('./style.css')

/* eslint-disable no-new */
new Vue({
  el: 'body',
  store,
  components: {
    app: App
  }
})
