import * as classNames from 'classnames'
import { observer } from 'mobx-react'
import * as React from 'react'
import Store, { RUNNING } from '../../Store'
import Switch from '../Switch'
import './index.css'

const examples = `~/app$ hotel add 'cmd'
~/app$ hotel add 'cmd -p $PORT'
~/app$ hotel add http://192.16.1.2:3000`

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

export interface IProps {
  store: Store
}

function Nav({ store }: IProps) {
  const { selectedMonitorId, monitors, proxies } = store
  return (
    <div className="nav">
      <header>hotel</header>
      <div className="menu">
        {monitors.size === 0 &&
          proxies.size === 0 && (
            <div>
              <p>
                Congrats!<br />
                You're successfully running hotel.
              </p>
              <p>
                To add a server, use{' '}
                <code style={{ padding: 5 }}>hotel add</code>
              </p>
              <pre>
                <code>{examples}</code>
              </pre>
            </div>
          )}

        {monitors.size > 0 && (
          <div>
            <h2>monitors</h2>
            <ul>
              {Array.from(monitors).map(([id, monitor]) => (
                <li
                  key={id}
                  className={classNames({
                    selected: id === selectedMonitorId,
                    running: monitor.status === RUNNING
                  })}
                  onClick={() => store.selectMonitor(id)}
                >
                  <span>
                    <a
                      href={href(id)}
                      title={`directory: ${monitor.cwd}\ncommand: ${monitor.commandString}`}
                      target="_blank"
                      onClick={e => e.stopPropagation()}
                    >
                      {id}
                    </a>
                  </span>
                  <span>
                    {monitor.status !== 'running' &&
                      monitor.status !== 'stopped' && (
                        <span>{monitor.status}</span>
                      )}{' '}
                    <Switch
                      onClick={() => store.toggleMonitor(id)}
                      checked={monitor.status === RUNNING}
                    />
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {proxies.size > 0 && (
          <div>
            <h2>proxies</h2>
            <ul>
              {Array.from(proxies).map(([id, proxy]) => (
                <li key={id}>
                  {' '}
                  <span>
                    <a href={href(id)} title={proxy.target} target="_blank">
                      {id}
                    </a>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
      <footer>
        <a href="https://github.com/typicode/hotel" target="_blank">
          README
        </a>
      </footer>
    </div>
  )
}

export default observer(Nav)
