<template>
  <div id="app">
    <!-- list -->
    <aside v-show="isListFetched">
      <div class="container fade-in" v-show="isListEmpty">
        <p>
          Congrats!<br>
          You're successfully running hotel.
        </p>
        <p>
          To add a server, use <code style="padding: 5px">hotel add</code>
        </p>
        <pre><code>~/app$ hotel add 'cmd'
    ~/app$ hotel add 'cmd -p $PORT'
    ~/app$ hotel add http://192.16.1.2:3000</code></pre>
      </div>
      <ul>
        <!-- monitors list -->
        <li class="fade-in" v-for="(item, id) in monitors">
          <!-- monitor -->
          <div class="item.status">
            <a
              :href="href(id)"
              :title="title(id)"
              :target="target">{{ id }}</a>
            <br>
            <small @click="select(id)">
              {{item.status}}
            </small>
          </div>

          <!-- start/stop button -->
          <button
            :title="isRunning(id) ? 'stop' : 'start'"
            :class="['status', isRunning(id) ? 'running' : '']"
            @click="toggle(id)">
            <i :class="isRunning(id) ? 'ion-toggle-filled' : 'ion-toggle'"></i>
          </button>

          <!-- view logs button -->
          <button
            title="view logs"
            :class="['logs', isSelected(id) ? 'selected' : '']"
            @click="select(id)">
            <i class="ion-chevron-right"></i>
          </button>
        </li>

        <!-- proxies list -->
        <li v-for="(item, id) in proxies">
          <div>
            <a
              :href="href(id)"
              :title="title(id)"
              :target="target">{{ id }}</a>
            <br>
            <small>{{ item.target }}</small>
          </div>
        </li>
      </ul>

      <footer>
        <a :target="target" href="https://github.com/typicode/hotel">
          readme <sup class="version">v{{ version }}</sup>
        </a>
      </footer>
    </aside>
    <main
      ref="output"
      :style="{ display: selected ? 'block' : 'none' }"
      :class="{ dark: isDark }"
      @scroll="onScroll">
      <button
        id="down"
        title="scroll to bottom"
        @click="scrollToBottom">
        <i class="ion-arrow-down-c"></i>
      </button>
      <button
        id="theme"
        title="switch theme"
        @click="switchTheme">
        <i class="ion-lightbulb"></i>
      </button>
      <div class="container">
        <div v-if="output.length === 0">
          # No output
        </div>
        <div
          v-for="item in output"
          v-html="item.text"
          :key="item.uid">
        </div>
      </div>
    </main>
  </div>
</template>

<script>
import Vue from 'vue'
import ansi2HTML from 'ansi2html'
import escapeHTML from 'escape-html'
import difference from 'lodash.difference'
import uid from 'uid'
import { version } from '../../package.json'

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

export default {
  data () {
    return {
      list: {},
      selected: null,
      outputs: {},
      outputScroll: true,
      target,
      isListFetched: false,
      version,
      isDark: localStorage.getItem('isDark') || false
    }
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
          fetch('/_/servers')
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
      // optimistic update
      if (this.list[id]) {
        this.list[id].status = 'running'
      }
      // change server state
      fetch(`/_/servers/${id}/start`, { method: 'POST' })
    },
    stopMonitor (id) {
      // optimistic update
      if (this.list[id]) {
        this.list[id].status = 'stopped'
      }
      // change server state
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
    isSelected (id) {
      return this.selected === id
    },
    onScroll (event) {
      const { scrollHeight, scrollTop, clientHeight } = event.target
      this.outputScroll = scrollHeight - scrollTop === clientHeight
    },
    scrollToBottom () {
      this.outputScroll = true
      this.$refs.output.scrollTop = this.$refs.output.scrollHeight
    },
    switchTheme () {
      this.isDark = !this.isDark
      localStorage.setItem('isDark', this.isDark)
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
}
</script>
