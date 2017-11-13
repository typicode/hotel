import React from 'react'
import PropTypes from 'prop-types'
import cx from 'classnames'

import { IconButton, CloseButton } from './button'

const defaultNavLabel = {
  toString() {
    console.error('Specify a navbar label if the navbar is visible')
    return '<unknown>'
  }
}

export const Main = ({
  visible,

  onRef,
  className,
  classList,

  showNavbar = true,
  navLabel = defaultNavLabel,

  title,
  mobileTitle,

  onClose,
  onToggleTheme,

  extraButton,
  children,

  ...mainProps
}) =>
  visible && (
    <main
      {...mainProps}
      ref={onRef}
      className={cx('hero', className, classList)}
    >
      {showNavbar && (
        <nav role="navigation" aria-label={`${navLabel} navigation`}>
          <CloseButton themed onClick={onClose} />
          <h1 className="name is-hidden-mobile">{title}</h1>
          <h1 className="name is-hidden-tablet">{mobileTitle}</h1>
          {extraButton}
          <IconButton
            themed
            title="switch theme"
            onClick={onToggleTheme}
            icon="lightbulb"
          />
        </nav>
      )}
      {typeof children === 'string' || React.Children.count(children) !== 1 ? (
        <div className="main-content">{children}</div>
      ) : (
        React.cloneElement(React.Children.only(children), {
          className: cx(
            React.Children.only(children).props.className,
            'main-content'
          )
        })
      )}
    </main>
  )

Main.propTypes = {
  visible: PropTypes.any,

  onRef: PropTypes.func,
  className: PropTypes.string,
  classList: PropTypes.oneOfType([
    PropTypes.array,
    PropTypes.string,
    PropTypes.object
  ]),

  showNavbar: PropTypes.bool,
  navLabel: PropTypes.string,

  title: PropTypes.node,
  mobileTitle: PropTypes.node,

  onClose: PropTypes.func,
  onToggleTheme: PropTypes.func,

  extraButton: PropTypes.node,
  children: PropTypes.node.isRequired
}
