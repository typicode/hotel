import React from 'react'
import PropTypes from 'prop-types'
import cx from 'classnames'

const sizes = {
  medium: 2
}

export const Icon = ({ name, size, style }) => (
  <span
    className={cx('icon', size && `is-${size}`)}
    style={{
      fontSize: `${sizes[size] || 1}em`,
      ...style
    }}
  >
    <i className={'ion-' + name} />
  </span>
)

Icon.propTypes = {
  name: PropTypes.string.isRequired,
  size: PropTypes.string,
  style: PropTypes.object
}
