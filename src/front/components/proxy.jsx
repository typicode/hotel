import React from 'react'
import PropTypes from 'prop-types'

import { href } from '../common'
import { Row } from './row'

export const Proxy = ({ item }) => (
  <Row
    href={href(item.get('id'))}
    title={item.get('target')}
    name={item.get('id')}
    label={item.get('target')}
  />
)

Proxy.propTypes = {
  item: PropTypes.object.isRequired
}
