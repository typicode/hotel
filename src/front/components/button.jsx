import React from 'react'
import PropTypes from 'prop-types'
import cx from 'classnames'

import { Icon } from './icon'

import { isDarkChannel, subscribe } from '../context'

export const Button = subscribe(
  isDarkChannel
)(({ title, classes, themed, onClick, children, [isDarkChannel]: isDark }) => (
  <button
    title={title}
    className={cx('button', { 'is-black': themed && isDark }, classes)}
    onClick={onClick}
  >
    {children}
  </button>
))

Button.propTypes = {
  title: PropTypes.string.isRequired,
  classes: PropTypes.oneOfType([
    PropTypes.array,
    PropTypes.string,
    PropTypes.object
  ]),
  themed: PropTypes.bool,
  onClick: PropTypes.func,
  children: PropTypes.node.isRequired
}

// prop types are correctly assigned below
// eslint-disable-next-line react/prop-types
export const IconButton = ({ icon, ...props }) => (
  <Button {...props}>
    <Icon name={icon} />
  </Button>
)
IconButton.PropTypes = Object.assign({}, Button.propTypes, {
  icon: Icon.propTypes.name
})

export const CloseButton = ({ classes, onClick }) => (
  <Button title="close" classes={classes} onClick={onClick}>
    <span className="icon">
      <i className="ion-chevron-left is-hidden-tablet" />
      <i className="ion-close is-hidden-mobile" />
    </span>
  </Button>
)

CloseButton.propTypes = {
  classes: Button.propTypes.classes,
  onClick: Button.propTypes.onClick
}
