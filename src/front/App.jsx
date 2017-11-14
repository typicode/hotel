import React from 'react'
import difference from 'lodash.difference'
import uid from 'uid'
import cx from 'classnames'
import Immutable from 'immutable'

import * as api from './api'
import { version } from '../../package.json'

import { IconButton } from './components/button'
import { Icon } from './components/icon'
import { Log } from './components/log'
import { ServerList } from './components/server-list'
import { Main } from './components/main'

import { Broadcast } from 'react-broadcast'
import { isDarkChannel } from './context'

export class App extends React.Component {
  state = {
    list: Immutable.Map(),
    selected: null,
    outputs: Immutable.Map(),
    outputScroll: true,
    isListFetched: false,
    configOpen: true,
    version,
    isDark: JSON.parse(localStorage.getItem('isDark')) || false
  }

  componentWillMount() {
    this.watchList()
    this.watchOutput()
  }
  componentDidUpdate() {
    if (this.state.outputScroll) {
      this.scrollToBottom()
    }
  }

  watchList() {
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
  }
  watchOutput() {
    api.watchOutput(({ id, output }) => {
      for (const line of Immutable.fromJS(output)) {
        this.setState({
          outputs: this.state.outputs.update(id, lines =>
            lines.push(line.set('uid', uid())).slice(-1000)
          )
        })
      }
    })
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
  href(id) {
    const { protocol, hostname } = window.location
    if (/hotel\./.test(hostname)) {
      const tld = hostname.split('.').slice(-1)[0]
      return `${protocol}//${id}.${tld}`
    } else {
      return `/${id}`
    }
  }
  title(id) {
    const item = this.state.list.get(id)
    if (item.get('status')) {
      return `DIR: ${item.get('cwd')}\nCMD: ${item.get('command').join(' ')}`
    } else {
      return item.get('target')
    }
  }
  isRunning(id) {
    const item = this.state.list.get(id)
    return item && item.get('status') === 'running'
  }
  selectMonitor = id => {
    if (this.state.selected === id) {
      this.setState({
        selected: null
      })
    } else {
      this.setState({
        selected: id,
        configOpen: false
      })
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

  toggleConfig = () => {
    this.deselect()
    this.setState(({ configOpen }) => ({ configOpen: !configOpen }))
  }

  output() {
    return this.state.outputs.get(this.state.selected, Immutable.List())
  }
  monitors() {
    const obj = {}

    this.state.list
      .entrySeq()
      .sort()
      .filter(([key, value]) => value.get('status'))
      .forEach(([key, value]) => {
        obj[key] = value
      })

    return obj
  }
  proxies() {
    const obj = {}

    this.state.list
      .entrySeq()
      .sort()
      .filter(([key, value]) => !value.get('status'))
      .forEach(([key, value]) => {
        obj[key] = value
      })

    return obj
  }

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
        {/* list */}
        <aside>
          <div
            className="fade-in content"
            hidden={!this.state.isListFetched || !this.state.list.isEmpty()}
          >
            <p>
              Congrats!<br />
              You’re successfully running hotel.
            </p>
            <p>
              To add a server, use <code style={{ padding: 5 }}>hotel add</code>
            </p>
            <pre>
              <code>
                ~/app$ hotel add &apos;cmd&apos;<br />
                ~/app$ hotel add &apos;cmd -p $PORT&apos;<br />
                ~/app$ hotel add http://192.16.1.2:3000
              </code>
            </pre>
          </div>
          <ServerList
            items={this.state.list.toArray()} // .toArray() returns values
            selected={this.state.selected}
            onSelect={this.selectMonitor}
            onStart={this.startMonitor}
            onStop={this.stopMonitor}
          />

          <footer>
            <a
              target="_blank"
              rel="noreferrer noopener"
              href="https://github.com/typicode/hotel"
            >
              readme <sup className="version">v{version}</sup>
            </a>
            {/* config button */}
            <IconButton
              title="change config"
              classes={[
                'config',
                this.state.configOpen ? 'is-dark' : 'is-white'
              ]}
              onClick={this.toggleConfig}
              icon="settings"
              style={{ float: 'right' }}
            />
          </footer>
        </aside>
        <Main
          visible={this.state.selected}
          onRef={this.outputRef}
          navLabel="log"
          title={this.state.selected}
          onClose={this.deselect}
          onToggleTheme={this.switchTheme}
          extraButton={
            <IconButton
              themed
              title="scroll to bottom"
              onClick={this.toggleScrollToBottom}
              icon="arrow-down-c"
            />
          }
          onScroll={this.onScroll}
        >
          <pre
            style={{
              display: this.output().isEmpty() ? 'flex' : 'block'
            }}
          >
            {this.monitors()[this.state.selected] && (
              <div>
                $ cd {this.monitors()[this.state.selected].cwd}
                <br />
                ${' '}
                {this.state.list.getIn([this.state.selected, 'command']).last()}
              </div>
            )}
            {this.output().isEmpty() && (
              <div className="blank-slate">no logs</div>
            )}
            {this.output().map(item => (
              <Log key={item.get('uid')} item={item} />
            ))}
          </pre>
        </Main>
        <Main
          visible={!this.state.selected && !this.state.configOpen}
          className="blank-slate is-hidden-mobile"
          showNavbar={false}
          navLabel="config"
        >
          choose an app to view its logs
        </Main>
        <Main
          visible={this.state.configOpen}
          className="config"
          navLabel="config"
          title={
            <Icon name="settings" size="medium" style={{ margin: '-1rem' }} />
          }
          mobileTitle={[
            <Icon key="icon" name="settings" size="medium" />,
            'Config'
          ]}
          extraButton={
            <IconButton
              themed
              title="save"
              onClick={this.saveChanges}
              icon="checkmark"
            />
          }
          onClose={this.toggleConfig}
          onToggleTheme={this.switchTheme}
        >
          <h1
            className="title is-1 is-hidden-mobile has-text-centered"
            style={{ marginTop: '0.5em', color: 'inherit' }}
          >
            Config
          </h1>
        </Main>
      </div>
    )
  }
}
