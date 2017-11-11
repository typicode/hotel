import React from 'react'
import ansi2HTML from 'ansi2html'
import escapeHTML from 'escape-html'
import difference from 'lodash.difference'
import uid from 'uid'
import cx from 'classnames'
import Immutable from 'immutable'

<<<<<<< HEAD:src/front/App.jsx
import { blankLine } from './filters'
import * as api from './api'
=======
import * as api from '../api'
>>>>>>> 6f81bc4... App.jsx → components/app.jsx:src/front/components/app.jsx

import { Sidebar } from './sidebar'
import { Logs } from './logs'
import { Main } from './main'

import { Broadcast } from 'react-broadcast'
import { isDarkChannel } from '../context'

export class App extends React.Component {
  state = {
    list: Immutable.Map(),
    selected: null,
    outputs: Immutable.Map(),
    outputScroll: true,
    isListFetched: false,
    isDark: JSON.parse(localStorage.getItem('isDark')) || false
  }

  componentWillMount() {
    api.watchServers(data => {
      const list = Immutable.fromJS(data)

      let outputs = this.state.outputs
      difference(
        list.keySeq().toArray(),
        this.state.list.keySeq().toArray()
      ).forEach(key => {
        outputs = outputs.delete(key)
      })

      for (const key of list.keys()) {
        if (!outputs.get(key)) {
          outputs = outputs.set(key, Immutable.List())
        }
      }

      this.setState({
        outputs,
        list,
        isListFetched: true
      })
    })
    api.watchOutput(({ id, output }) => {
      let outputs = this.state.outputs
      // add output
      output
        .replace(/\n$/, '')
        .split('\n')
        .map(line => {
          // filter line
          line = escapeHTML(line)
          line = ansi2HTML(line)
          line = blankLine(line)
          return line
        })
        .forEach(line => {
          outputs = outputs.set(
            id,
            outputs
              .get(id)
              .push({ __html: line, uid: uid() })
              // keep 1000 lines only
              .slice(0, 1000)
          )
        })
      this.setState({ outputs })
    })
  }
  componentDidUpdate() {
    if (this.state.outputScroll) {
      this.scrollToBottom()
    }
  }

  startMonitor = id => {
    // optimistic update
    if (this.state.list.has(id)) {
      this.setState(({ list }) => ({
        list: list.setIn([id, 'status'], 'running')
      }))
    }
    // change server state
    api.startMonitor(id)
  }
  stopMonitor = id => {
    // optimistic update
    if (this.state.list.has(id)) {
      this.setState(({ list }) => ({
        list: list.setIn([id, 'status'], 'stopped')
      }))
    }
    // change server state
    api.stopMonitor(id)
  }
  selectMonitor = id => {
    if (this.state.selected === id) {
      this.setState({ selected: null })
    } else {
      this.setState({ selected: id })
    }
  }
  deselect = () =>
    this.setState({
      selected: null
    })
  onScroll = ({ target: { scrollHeight, scrollTop, clientHeight } }) =>
    this.setState({
      outputScroll: scrollHeight - scrollTop === clientHeight
    })
  toggleScrollToBottom = () => {
    this.setState(({ outputScroll }) => {
      const newOutputScroll = !outputScroll
      if (newOutputScroll) this.scrollToBottom()
      return {
        outputScroll: newOutputScroll
      }
    })
  }
  scrollToBottom = () => {
    if (this.outputEl) {
      this.outputEl.scrollTop = this.outputEl.scrollHeight
    }
  }
  outputRef = ref => {
    this.outputEl = ref
  }
  switchTheme = () =>
    this.setState(({ isDark }) => {
      localStorage.setItem('isDark', JSON.stringify(!isDark))
      return { isDark: !isDark }
    })

  wrapInBroadcast(children) {
    return (
      <Broadcast channel={isDarkChannel} value={this.state.isDark}>
        {children}
      </Broadcast>
    )
  }

  render() {
    return this.wrapInBroadcast(
      <div id="app" className={cx({ 'is-dark': this.state.isDark })}>
        <Sidebar
          serversFetched={this.state.isListFetched}
          servers={this.state.list}
          selectedServer={this.state.selected}
          onSelect={this.selectMonitor}
          onStart={this.startMonitor}
          onStop={this.stopMonitor}
        />
        <Logs
          visible={this.state.selected}
          onRef={this.outputRef}
          navLabel="log"
          title={this.state.selected}
          onClose={this.deselect}
          onToggleTheme={this.switchTheme}
          onScroll={this.onScroll}
<<<<<<< HEAD
        >
          <pre
            style={{
              display: output ? 'flex' : 'block'
            }}
          >
            {this.state.list.has(this.state.selected) && (
              <div>
                $ cd {this.state.list.getIn([this.state.selected, 'cwd'])}
                <br />
                ${' '}
                {this.state.list.getIn([this.state.selected, 'command']).last()}
              </div>
            )}
            {output ? (
              output.map(item => <Log key={item.get('uid')} item={item} />)
            ) : (
              <div className="blank-slate">no logs</div>
            )}
<<<<<<< HEAD
            {this.output().map(item => (
              <div key={item.uid} dangerouslySetInnerHTML={item} />
            ))}
=======
>>>>>>> 8657f0d... 🔥 <App />.{output,monitors}
          </pre>
        </Main>
=======
          toggleScrollToBottom={this.toggleScrollToBottom}
          output={this.state.outputs.get(this.state.selected)}
          mon={this.state.list.get(this.state.selected)}
        />
>>>>>>> 0bfa531... Extract a whole bunch of components from <App />
        <Main
          visible={!this.state.selected}
          className="blank-slate is-hidden-mobile"
          showNavbar={false}
        >
          choose an app to view its logs
        </Main>
      </div>
    )
  }
}
