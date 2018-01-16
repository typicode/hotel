import * as classNames from 'classnames'
import { observer } from 'mobx-react'
import * as React from 'react'
import Store, { RUNNING } from '../../Store'
import Link from '../Link'
import Switch from '../Switch'
import './index.css'

const examples = `~/app$ hotel add 'cmd'
~/app$ hotel add 'cmd -p $PORT'
~/app$ hotel add http://192.16.1.2:3000`

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
              <p>To add a server, use hotel add</p>
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
                  className={classNames('monitor', {
                    running: monitor.status === RUNNING,
                    selected: id === selectedMonitorId
                  })}
                  onClick={() => store.selectMonitor(id)}
                >
                  <span>
                    <Link className="listLink" id={id} name={monitor.name} />
                  </span>
                  <span>
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
                <li key={name}>
                  <span>
                    <Link className="listLink" id={id} name={id} />
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
