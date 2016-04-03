const Vue = require('vue')
const App = require('./components/App.vue')
const store = require('./store')

require('font-awesome/css/font-awesome.css')
require('./style.scss')

/* eslint-disable no-new */
new Vue({
  el: 'body',
  store,
  components: {
    app: App
  }
})
