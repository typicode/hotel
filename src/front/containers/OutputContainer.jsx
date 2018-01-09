import React from 'react'
import ansi2HTML from 'ansi2html'
import escapeHTML from 'escape-html'
import uid from 'uid'
import Output from '../components/Output'
import { watchOutput } from '../api'

function blankLine(val) {
  return val.trim() === '' ? '&nbsp;' : val
}

function formatOutput(output) {
  return output
    .replace(/\n$/, '')
    .split('\n')
    .map(text => {
      const html = blankLine(ansi2HTML(escapeHTML(text)))
      return { html, uid: uid() }
    })
}

class OutputContainer extends React.Component {
  constructor() {
    super()
    this.state = {}
  }

  componentDidMount() {
    watchOutput(({ id, output }) => {
      const nextOutput = (this.state[id] || []).concat(formatOutput(output))
      while (nextOutput.length > 1000) {
        nextOutput.shift()
      }
      this.setState({ [id]: nextOutput })
    })
  }

  render() {
    if (this.props.id) {
      return <Output lines={this.state[this.props.id]} />
    } else {
      return <div>Choose an app to view its logs</div>
    }
  }
}

OutputContainer.defaultProps = {
  id: null
}

export default OutputContainer
