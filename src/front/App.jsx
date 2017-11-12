import React from 'react'
import ansi2HTML from 'ansi2html'
import escapeHTML from 'escape-html'
import difference from 'lodash.difference'
import uid from 'uid'
import cx from 'classnames'
import Immutable from 'immutable'

import { blankLine } from './filters'
import * as api from './api'
import { version } from '../../package.json'

import { IconButton, CloseButton } from './components/button'
import { Icon } from './components/icon'

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
      this.scrollToBottom(false)
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
  startMonitor(id) {
    // optimistic update
    if (this.state.list.has(id)) {
      this.setState(({ list }) => ({
        list: list.setIn([id, 'status'], 'running')
      }))
    }
    // change server state
    api.startMonitor(id)
  }
  stopMonitor(id) {
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
  toggle(id) {
    this.isRunning(id) ? this.stopMonitor(id) : this.startMonitor(id)
  }
  select(id) {
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
  deselect() {
    this.setState({
      selected: null
    })
  }
  onScroll(event) {
    const { scrollHeight, scrollTop, clientHeight } = event.target
    this.setState({
      outputScroll: scrollHeight - scrollTop === clientHeight
    })
  }
  scrollToBottom(_setState = true) {
    if (!this.state.outputScroll && _setState) {
      this.setState({
        outputScroll: true
      })
    }
    this.refs.output.scrollTop = this.refs.output.scrollHeight
  }
  switchTheme() {
    this.setState(({ isDark }) => {
      localStorage.setItem('isDark', JSON.stringify(!isDark))
      return { isDark: !isDark }
    })
  }
  toggleConfig() {
    this.deselect()
    this.setState(({ configOpen }) => ({ configOpen: !configOpen }))
  }

  output() {
    if (this.state.selected) {
      return this.state.outputs.get(this.state.selected)
    }

    return Immutable.List()
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

  render() {
    const blackIfDark = { 'is-black': this.state.isDark }
    return (
      <div id="app" className={cx({ 'is-dark': this.state.isDark })}>
        {/* list */}
        <aside hidden={!this.state.isListFetched}>
          <div className="fade-in" hidden={!this.state.list.isEmpty()}>
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
          <ul className="hotel-menu">
            {/* monitors list */}
            {Object.keys(this.monitors())
              .map(k => [k, this.monitors()[k]])
              .map(([id, item]) => (
                <li key={id} className="level fade-in is-mobile">
                  {/* monitor */}
                  <div className="level-left">
                    <div className="level-item">
                      <div>
                        <p>
                          <a
                            href={this.href(id)}
                            title={this.title(id)}
                            target="_blank"
                          >
                            {id}
                          </a>
                        </p>
                        <p>
                          <small
                            onClick={() => this.select(id)}
                            title={
                              item.pid
                                ? `PID ${item.get('pid')}\nStarted ${new Date(
                                    item.get('started')
                                  ).toLocaleString()}`
                                : ''
                            }
                          >
                            {item.get('status')}
                          </small>
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* start/stop button */}
                  <div className="level-right">
                    <div className="level-item">
                      <input
                        id={'app-toggle-' + id}
                        type="checkbox"
                        className="switch is-rounded is-small is-success"
                        title={this.isRunning(id) ? 'stop' : 'start'}
                        onChange={({ target: { checked } }) =>
                          checked
                            ? this.startMonitor(id)
                            : this.stopMonitor(id)}
                        checked={this.isRunning(id)}
                      />
                      <label htmlFor={'app-toggle-' + id}>&nbsp;</label>
                    </div>

                    {/* view logs button */}
                    <IconButton
                      title="view logs"
                      classes={[
                        'logs',
                        'level-item',
                        this.state.selected === id ? 'is-dark' : 'is-white'
                      ]}
                      onClick={() => this.select(id)}
                      icon="ios-paper"
                    />
                  </div>
                </li>
              ))}
            {/* proxies list */}
            {Object.keys(this.proxies())
              .map(k => [k, this.proxies()[k]])
              .map(([id, item]) => (
                <li key={id} className="level fade-in is-mobile">
                  <div>
                    <a
                      href={this.href(id)}
                      title={this.title(id)}
                      target="_blank"
                    >
                      {id}
                    </a>
                    <br />
                    <small>{item.get('target')}</small>
                  </div>
                </li>
              ))}
          </ul>

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
              onClick={() => this.toggleConfig()}
              icon="settings"
              style={{ float: 'right' }}
            />
          </footer>
        </aside>
        <main
          ref="output"
          hidden={!this.state.selected}
          className="hero"
          onScroll={event => this.onScroll(event)}
        >
          <nav role="navigation" aria-label="log navigation">
            <CloseButton
              classes={blackIfDark}
              onClick={() => this.deselect()}
            />
            <div className="flex-spacer is-hidden-mobile" />
            <h1 className="name is-hidden-tablet">{this.state.selected}</h1>
            <IconButton
              title="scroll to bottom"
              classes={blackIfDark}
              onClick={() => this.scrollToBottom()}
              icon="arrow-down-c"
            />
            <IconButton
              title="switch theme"
              classes={blackIfDark}
              onClick={() => this.switchTheme()}
              icon="lightbulb"
            />
          </nav>
          <pre
            className="main-content"
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
              <div key={item.uid} dangerouslySetInnerHTML={item} />
            ))}
          </pre>
        </main>
        <main
          hidden={this.state.selected || this.state.configOpen}
          className="blank-slate hero is-hidden-mobile"
        >
          choose an app to view its logs
        </main>
        <main hidden={!this.state.configOpen} className="config hero">
          <nav role="navigation" aria-label="config navigation">
            <CloseButton
              classes={blackIfDark}
              onClick={() => this.toggleConfig()}
            />
            <h1 className="name is-hidden-mobile">
              <Icon name="settings" size="medium" style={{ margin: '-1rem' }} />
            </h1>
            <h1 className="name is-hidden-tablet">
              <Icon name="settings" size="medium" />
              Config
            </h1>
            <IconButton
              title="save"
              classes={blackIfDark}
              onClick={() => this.saveChanges()}
              icon="checkmark"
            />
            <IconButton
              title="switch theme"
              classes={blackIfDark}
              onClick={() => this.switchTheme()}
              icon="lightbulb"
            />
          </nav>
          <div className="main-content">
            <h1
              className="title is-1 is-hidden-mobile has-text-centered"
              style={{ marginTop: '0.5em', color: 'inherit' }}
            >
              Config
            </h1>
          </div>
        </main>
      </div>
    )
  }
}
