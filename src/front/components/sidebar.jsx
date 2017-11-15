import React from 'react'
import PropTypes from 'prop-types'

import { version } from '../../../package.json'

import { ServerList } from './server-list'
import { Intro } from './intro'

export const Sidebar = ({
  serversFetched,
  servers,
  selectedServer,
  onSelect,
  onStart,
  onStop
}) => (
  <aside>
    {serversFetched ? (
      servers.isEmpty() && <Intro serversFetched={serversFetched} />
    ) : (
      <div className="blank-slate">Loading monitors&hellip;</div>
    )}
    {!servers.isEmpty() && (
      <ServerList
        items={servers.toArray()} // .toArray() returns values
        selected={selectedServer}
        onSelect={onSelect}
        onStart={onStart}
        onStop={onStop}
      />
    )}

    <footer>
      <a
        target="_blank"
        rel="noreferrer noopener"
        href="https://github.com/typicode/hotel"
      >
        readme <sup className="version">v{version}</sup>
      </a>
    </footer>
  </aside>
)

Sidebar.propTypes = {
  serversFetched: PropTypes.bool.isRequired,
  servers: PropTypes.object.isRequired,
  selectedServer: PropTypes.string,
  onSelect: PropTypes.func,
  onStart: PropTypes.func,
  onStop: PropTypes.func
}
