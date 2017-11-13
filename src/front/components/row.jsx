import React from 'react'
import PropTypes from 'prop-types'

export const Row = ({ href, title, subtitle, name, label, right }) => (
  <div className="level fade-in is-mobile">
    <div className="monitor-info level-item">
      <a href={href} title={title} target="_blank">
        {name}
      </a>
      <small title={subtitle}>{label}</small>
    </div>
    {right && <div className="level-right">{right}</div>}
  </div>
)

Row.propTypes = {
  href: PropTypes.string.isRequired,
  title: PropTypes.string,
  subtitle: PropTypes.string,
  name: PropTypes.node.isRequired,
  label: PropTypes.node.isRequired,
  right: PropTypes.node
}
