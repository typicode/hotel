import React from 'react'
import { watchServers } from '../api'
import MonitorItemContainer from './MonitorItemContainer'

class ServerListContainer extends React.Component {
  constructor(props) {
    super(props)
    this.state = { servers: [] }
  }

  componentDidMount() {
    watchServers(data => {
      // Convert to array
      const servers = Object.keys(data).map(id => ({
        id,
        ...data[id]
      }))
      this.setState({ servers })
    })
  }

  render() {
    return (
      <ul>
        {this.state.servers.map(monitor => (
          <MonitorItemContainer
            key={monitor.id}
            monitor={monitor}
            onSelect={this.props.onSelect}
          />
        ))}
      </ul>
    )
  }
}

export default ServerListContainer
