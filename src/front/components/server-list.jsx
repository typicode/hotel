import React from 'react'
import PropTypes from 'prop-types'

import { Monitor } from './monitor'
import { Proxy } from './proxy'

export const ServerList = ({ items, onSelect, onStart, onStop, selected }) => (
  <ul className="hotel-menu">
    {/* monitors list */}
    {items
      .filter(item => item.get('status'))
      .map(item => (
        <Monitor
          key={item.get('id')}
          item={item}
          onSelect={onSelect}
          onStart={onStart}
          onStop={onStop}
          isSelected={selected === item.get('id')}
        />
      ))}
    {/* proxies list */}
    {items
      .filter(item => !item.get('status'))
      .map(item => <Proxy key={item.get('id')} item={item} />)}
  </ul>
)

ServerList.propTypes = {
  items: PropTypes.arrayOf(PropTypes.object).isRequired,
  selected: PropTypes.string,
  onSelect: PropTypes.func,
  onStart: PropTypes.func,
  onStop: PropTypes.func
}
