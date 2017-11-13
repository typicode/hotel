import React from 'react'
import PropTypes from 'prop-types'

import { href } from '../common'

import { IconButton } from './button'
import { Row } from './row'

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
      <Row
        href={href(id)}
        title={`DIR: ${item.get('cwd')}\nCMD: ${item.get('command').join(' ')}`}
        name={id}
        subtitle={
          item.get('pid') &&
          `PID ${item.get('pid')}\nStarted ${new Date(
            item.get('started')
          ).toLocaleString()}`
        }
        label={item.get('status')}
        right={[
          <div key="start/stop button" className="level-item">
            <input
              id={'app-toggle-' + id}
              type="checkbox"
              className="switch is-rounded is-small is-success"
              title={isRunning ? 'stop' : 'start'}
              onChange={this.onToggle}
              checked={isRunning}
            />
            <label htmlFor={'app-toggle-' + id}>&nbsp;</label>
          </div>,
          <IconButton
            key="view logs button"
            title="view logs"
            classes={[
              'logs',
              'level-item',
              isSelected ? 'is-dark' : 'is-white'
            ]}
            onClick={onSelect}
            icon="ios-paper"
          />
        ]}
      />
    )
  }
}
