<template>
  <div id="app">
    <!-- list -->
    <aside v-show="isListFetched">
      <div class="fade-in" v-show="isListEmpty">
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
      <ul class="hotel-menu">
        <!-- monitors list -->
        <li class="level fade-in is-mobile monitor" v-for="(item, id) in monitors">
          <!-- monitor -->
          <div class="level-left">
            <div class="level-item">
              <div>
                <p>
                  <a
                  :href="href(id)"
                  :title="title(id)"
                  target="_blank">{{ id }}</a>
                </p>
                <p>
                  <small @click="select(id)" :title="item.pid ? `PID ${item.pid}\nStarted ${new Date(item.started).toLocaleString()}` : ''">
                    {{item.status}}
                  </small>
                </p>
              </div>
            </div>
          </div>

          <!-- start/stop button -->
          <div class="level-right">
            <button
              :title="isRunning(id) ? 'stop' : 'start'"
              :class="['status', 'button', 'level-item', isRunning(id) ? 'is-success' : 'is-white']"
              @click="toggle(id)">
              <span class="icon">
                <i :class="isRunning(id) ? 'ion-toggle-filled' : 'ion-toggle'"></i>
              </span>
            </button>

            <!-- view logs button -->
            <button
              title="view logs"
              :class="['logs', 'button', 'level-item', isSelected(id) ? 'is-dark' : 'is-white']"
              @click="select(id)">
              <span class="icon">
                <i class="ion-ios-paper"></i>
              </span>
            </button>
          </div>
        </li>

        <!-- proxies list -->
        <li v-for="(item, id) in proxies">
          <div>
            <a
              :href="href(id)"
              :title="title(id)"
              target="_blank">{{ id }}</a>
            <br>
            <small>{{ item.target }}</small>
          </div>
        </li>
      </ul>

      <footer>
        <a target="_blank" href="https://github.com/typicode/hotel">
          readme <sup class="version">v{{ version }}</sup>
        </a>
      </footer>
    </aside>
    <main
      ref="output"
      :style="{ display: selected ? null : 'none' }"
      :class="[{ 'is-dark': isDark }, 'hero']"
      @scroll="onScroll">
      <nav role="navigation" aria-label="log navigation">
        <button
          id="back"
          :class="[{ 'is-black': isDark }, 'button']"
          title="close"
          @click="deselect">
          <span class="icon">
            <i class="ion-chevron-left is-hidden-tablet"></i>
            <i class="ion-close is-hidden-mobile"></i>
          </span>
        </button>
        <div class="spacer is-hidden-mobile"></div>
        <h1 class="name is-hidden-tablet">{{ selected }}</h1>
        <button
          id="down"
          :class="[{ 'is-black': isDark }, 'button']"
          title="scroll to bottom"
          @click="scrollToBottom">
          <span class="icon">
            <i class="ion-arrow-down-c"></i>
          </span>
        </button>
        <button
          id="theme"
          :class="[{ 'is-black': isDark }, 'button']"
          title="switch theme"
          @click="switchTheme">
          <span class="icon">
            <i class="ion-lightbulb"></i>
          </span>
        </button>
      </nav>
      <pre :style="{ display: output.length === 0 ? 'flex': 'block' }">
        <div v-if="monitors[selected]">
          $ cd {{ monitors[selected].cwd }}<br>
          $ {{ prettyCommand }}
        </div>
        <div class="blank-slate" v-if="output.length === 0">
          no logs
        </div>
        <div
          v-for="item in output"
          v-html="item.text"
          :key="item.uid">
        </div>
      </pre>
    </main>
    <main
      :style="{ display: selected ? 'none' : null }"
      class="blank-slate hero is-hidden-mobile">
      choose an app to view its logs
    </main>
  </div>
</template>

<script>
import Vue from 'vue'
import ansi2HTML from 'ansi2html'
import escapeHTML from 'escape-html'
import difference from 'lodash.difference'
import uid from 'uid'
import { blankLine } from './filters'
import * as api from './api'
import { version } from '../../package.json'

/* eslint-env browser */

// Expose Vue for Vue devtools
window.Vue = Vue

export default {
  data () {
    return {
      list: {},
      selected: null,
      outputs: {},
      outputScroll: true,
      isListFetched: false,
      version,
      isDark: JSON.parse(localStorage.getItem('isDark')) || false
    }
  },
  created () {
    this.watchList()
    this.watchOutput()
  },
  methods: {
    watchList () {
      api.watchServers(data => Vue.set(this, 'list', data))
    },
    watchOutput () {
      api.watchOutput(({ id, output }) =>
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
      )
    },
    startMonitor (id) {
      // optimistic update
      if (this.list[id]) {
        this.list[id].status = 'running'
      }
      // change server state
      api.startMonitor(id)
    },
    stopMonitor (id) {
      // optimistic update
      if (this.list[id]) {
        this.list[id].status = 'stopped'
      }
      // change server state
      api.stopMonitor(id)
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
    deselect () {
      this.selected = null
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
      localStorage.setItem('isDark', JSON.stringify(this.isDark))
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
    prettyCommand() {
      const command = this.list[this.selected].command
      return command[command.length - 1]
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
