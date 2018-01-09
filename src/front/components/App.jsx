import React from 'react'
import ServerListContainer from '../containers/ServerListContainer'
import OutputContainer from '../containers/OutputContainer'

export default function App({ selectedMonitorId, onSelect }) {
  return (
    <div className="container is-fluid">
      <div className="columns">
        <div className="column is-4">
          <ServerListContainer onSelect={onSelect} />
        </div>
        <div className="column is-8">
          <OutputContainer id={selectedMonitorId} />
        </div>
      </div>
    </div>
  )
}
