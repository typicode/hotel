import Vue from 'vue'
import ansi2HTML from 'ansi2html'
import escapeHTML from 'escape-html'
import difference from 'lodash.difference'
import uid from 'uid'

/* eslint-env browser */

// Expose Vue for Vue devtools
window.Vue = Vue

// Blank line filter
function blankLine (val) {
  return val.trim() === '' ? '&nbsp;' : val
}

// If in "menu" mode, links should be opened in a new window
// Useful only for third-party tools displaying this page in a menu
// Example: https://github.com/typicode/hotel#third-party-tools
const target = window.location.hash === '#menu'
  ? '_blank'
  : ''

// Template can be found in daemon/public/index.html
new Vue({ // eslint-disable-line
  el: '#app',
  data: {
    list: {},
    selected: null,
    outputs: {},
    outputScroll: true,
    target,
    isListFetched: false
  },
  created () {
    this.watchList()
    this.watchOutput()
  },
  methods: {
    watchList () {
      if (window.EventSource) {
        new EventSource('/_/events').onmessage = (event) => {
          Vue.set(this, 'list', JSON.parse(event.data))
        }
      } else {
        setInterval(() => {
          fetch('/_/events')
            .then(response => response.json())
            .then(data => Vue.set(this, 'list', data))
        }, 1000)
      }
    },
    watchOutput () {
      if (window.EventSource) {
        new EventSource('/_/events/output').onmessage = (event) => {
          const obj = JSON.parse(event.data)
          const { id, output } = obj

          // add output
          output
            .replace(/\n$/, '')
            .split('\n')
            .map((line) => {
              // filter line
              line = escapeHTML(line)
              line = ansi2HTML(line)
              line = blankLine(line)
              return line
            })
            .forEach((line) => {
              const arr = this.outputs[id]
              arr.push({ text: line, uid: uid() })
              // keep 1000 lines only
              if (arr.length > 1000) {
                arr.shift()
              }
            })
        }
      } else {
        alert('Sorry, server logs aren\'t supported on this browser :(')
      }
    },
    startMonitor (id) {
      fetch(`/_/servers/${id}/start`, { method: 'POST' })
    },
    stopMonitor (id) {
      fetch(`/_/servers/${id}/stop`, { method: 'POST' })
    },
    restart (id) {
      fetch(`/_/servers/${id}/restart`, { method: 'POST' })
    },
    href (id) {
      const { protocol, hostname } = window.location
      if (/hotel\./.test(hostname)) {
        const tld = hostname.split('.').slice(-1)[0]
        return `${protocol}//${id}.${tld}`
      } else {
        return `/${id}`
      }
    },
    title (id) {
      const item = this.list[id]
      if (item.status) {
        return `DIR: ${item.cwd}\nCMD: ${item.command.join(' ')}`
      } else {
        return item.target
      }
    },
    isRunning (id) {
      const item = this.list[id]
      return item && item.status === 'running'
    },
    toggle (id) {
      this.isRunning(id)
        ? this.stopMonitor(id)
        : this.startMonitor(id)
    },
    select (id) {
      if (this.selected === id) {
        this.selected = null
      } else {
        this.selected = id
      }
    },
    onScroll (event) {
      const { scrollHeight, scrollTop, clientHeight } = event.target.element
      this.outputScroll = scrollHeight - scrollTop === clientHeight
    },
    scrollToBottom () {
      this.outputScroll = true
      this.$refs.output.scrollTop = this.$refs.output.scrollHeight
    }
  },
  watch: {
    list (list, oldList) {
      // Flag to know if the first request to the server has been made
      this.isListFetched = true

      difference(Object.keys(list), Object.keys(oldList))
        .forEach((key) => Vue.delete(this.outputs, key))

      Object.keys(list)
        .forEach((key) => {
          if (!this.outputs[key]) {
            Vue.set(this.outputs, key, [])
          }
        })
    },
    output () {
      this.$nextTick(() => {
        // keep scroll at the bottom if it already is
        if (this.outputScroll) {
          this.scrollToBottom()
        }
      })
    }
  },
  computed: {
    output () {
      if (this.selected) {
        return this.outputs[this.selected]
      }

      return []
    },
    monitors () {
      const obj = {}

      Object
        .keys(this.list)
        .sort()
        .filter((key) => {
          const isMonitor = this.list[key].status
          return isMonitor
        })
        .forEach((key) => { obj[key] = this.list[key] })

      return obj
    },
    proxies () {
      const obj = {}

      Object
        .keys(this.list)
        .sort()
        .filter((key) => {
          const isProxy = !this.list[key].status
          return isProxy
        })
        .forEach((key) => { obj[key] = this.list[key] })

      return obj
    },
    isListEmpty () {
      return Object.keys(this.list).length === 0
    }
  }
})
