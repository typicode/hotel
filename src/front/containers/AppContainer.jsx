import React from 'react'
import App from '../components/App'

class AppContainer extends React.Component {
  constructor() {
    super()
    this.state = {
      selectedMonitorId: null
    }
  }
  render() {
    return (
      <App
        selectedMonitorId={this.state.selectedMonitorId}
        onSelect={selectedMonitorId => this.setState({ selectedMonitorId })}
      />
    )
  }
}

export default AppContainer
