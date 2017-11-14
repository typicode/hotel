import React from 'react'

export const Intro = props => (
  <div {...props}>
    <p>
      Congrats!<br />
      You’re successfully running hotel.
    </p>
    <p>
      To add a server, use <code style={{ padding: 5 }}>hotel add</code>
    </p>
    <pre>
      <code>
        ~/app$ hotel add &apos;cmd&apos;<br />
        ~/app$ hotel add &apos;cmd -p $PORT&apos;<br />
        ~/app$ hotel add http://192.16.1.2:3000
      </code>
    </pre>
  </div>
)
