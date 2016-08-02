import Vue from 'vue'
import ansiHTML from 'ansi2html'
import escapeHTML from 'escape-html'
import difference from 'lodash.difference'
import uid from 'uid'

/* eslint-env browser */

// Expose Vue for Vue devtools, maybe a better way using WebPack
window.Vue = Vue

// Blank line filter
function blankLine (val) {
  return val.trim() === '' ? '&nbsp;' : val
}

new Vue({ // eslint-disable-line
  el: '#app',
  data: {
    list: {},
    selected: null,
    outputs: {},
    outputScroll: true
  },
  created () {
    this.watchList()
    this.watchOutput()
  },
  filters: {
    ansi: ansiHTML,
    escape: escapeHTML,
    blank: blankLine
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
      const element = event.target
      this.outputScroll = element.scrollHeight - element.scrollTop === element.clientHeight
    },
    scrollToBottom () {
      this.outputScroll = true
      this.$els.output.scrollTop = this.$els.output.scrollHeight
    }
  },
  watch: {
    list (list, oldList) {
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
        .filter((key) => { return this.list[key].status })
        .forEach((key) => { obj[key] = this.list[key] })

      return obj
    },
    proxies () {
      const obj = {}

      Object
        .keys(this.list)
        .filter((key) => { return !this.list[key].status })
        .forEach((key) => { obj[key] = this.list[key] })

      return obj
    },
    isListEmpty () {
      return Object.keys(this.list).length === 0
    }
  }
})
