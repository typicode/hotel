import React from 'react'

function Output({ lines }) {
  return (
    <pre>
      {lines.map(line => (
        <div key={line.uid} dangerouslySetInnerHTML={{ __html: line.html }} />
      ))}
    </pre>
  )
}

Output.defaultProps = {
  lines: []
}

export default Output
