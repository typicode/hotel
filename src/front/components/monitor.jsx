import React from 'react'
import PropTypes from 'prop-types'

import { IconButton } from './button'

const href = id => {
  const { protocol, hostname } = window.location
  if (/hotel\./.test(hostname)) {
    const tld = hostname.split('.').slice(-1)[0]
    return `${protocol}//${id}.${tld}`
  } else {
    return `/${id}`
  }
}

const title = item => {
  if (item.get('status')) {
    return `DIR: ${item.get('cwd')}\nCMD: ${item.get('command').join(' ')}`
  } else {
    return item.get('target')
  }
}

const subtitle = item => {
  if (item.get('pid')) {
    return `PID ${item.get('pid')}\nStarted ${new Date(
      item.get('started')
    ).toLocaleString()}`
  } else {
    return ''
  }
}

export class Monitor extends React.Component {
  static propTypes = {
    id: PropTypes.string.isRequired,
    item: PropTypes.object.isRequired,
    onSelect: PropTypes.func.isRequired,
    onStart: PropTypes.func.isRequired,
    onStop: PropTypes.func.isRequired,
    isSelected: PropTypes.bool.isRequired
  }

  onToggle = ({ target: { checked } }) =>
    checked ? this.props.onStart() : this.props.onStop()

  render() {
    const { id, item, onSelect, isSelected } = this.props
    const isRunning = item.get('status') === 'running'
    return (
      <div className="level fade-in is-mobile">
        <div className="level-left">
          <div className="level-item">
            <div>
              <p>
                <a href={href(id)} title={title(item)} target="_blank">
                  {id}
                </a>
              </p>
              <p>
                <small title={subtitle(item)}>{item.get('status')}</small>
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
              title={isRunning ? 'stop' : 'start'}
              onChange={this.onToggle}
              checked={isRunning}
            />
            <label htmlFor={'app-toggle-' + id}>&nbsp;</label>
          </div>

          {/* view logs button */}
          <IconButton
            title="view logs"
            classes={[
              'logs',
              'level-item',
              isSelected ? 'is-dark' : 'is-white'
            ]}
            onClick={onSelect}
            icon="ios-paper"
          />
        </div>
      </div>
    )
  }
}
