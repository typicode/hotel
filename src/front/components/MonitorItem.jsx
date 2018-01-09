import React from 'react'

function href(id) {
  const { protocol, hostname } = window.location
  if (/hotel\./.test(hostname)) {
    // Accessed using hotel.tld
    const tld = hostname.split('.').slice(-1)[0]
    return `${protocol}//${id}.${tld}`
  } else {
    // Accessed using localhost
    return `/${id}`
  }
}

function linkTitle(monitor) {
  if (monitor.status) {
    return `DIR: ${monitor.cwd}\nCMD: ${monitor.command.join(' ')}`
  } else {
    return monitor.target
  }
}

function statusTitle(monitor) {
  return monitor.pid
    ? `PID ${monitor.pid}\nStarted ${new Date(
        monitor.started
      ).toLocaleString()}`
    : ''
}

function isRunning(monitor) {
  return monitor.status === 'running'
}

export default function MonitorItem({
  monitor,
  isSelected,
  onToggle,
  onSelect
}) {
  return (
    <li className="level" onClick={onSelect}>
      <div className="level-left">
        <div className="level-item">
          <div>
            <p>
              <a
                href={href(monitor.id)}
                title={linkTitle(monitor.id)}
                target="_blank"
              >
                {monitor.id}
              </a>
            </p>
            <p>
              <small onClick={onSelect} title={statusTitle(monitor)}>
                {monitor.status}
              </small>
            </p>
          </div>
        </div>
      </div>

      <div className="level-right">
        <div className="level-item">
          <input
            id={`monitor-${monitor.id}`}
            type="checkbox"
            className="switch is-rounded"
            title={isRunning(monitor) ? 'stop' : 'start'}
            onClick={onToggle}
            checked={isRunning(monitor)}
          />
          <label htmlFor={`monitor-${monitor.id}`}>&nbsp;</label>
        </div>

        <div className="level-item">
          <button
            title="view logs"
            className="['logs', 'button', isSelected(id) ? 'is-dark' : 'is-white']"
            onClick={onSelect}
          >
            <span className="icon">
              <i className="ion-ios-paper" />
            </span>
          </button>
        </div>
      </div>
    </li>
  )
}
