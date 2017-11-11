import React from 'react'
import PropTypes from 'prop-types'

import { IconButton } from './button'
import { Log } from './log'

import { Main } from './main'

export const Logs = ({ toggleScrollToBottom, output, mon, ...props }) => (
  <Main
    extraButton={
      <IconButton
        themed
        title="scroll to bottom"
        onClick={toggleScrollToBottom}
        icon="arrow-down-c"
      />
    }
    {...props}
  >
    <pre
      style={{
        display: output ? 'flex' : 'block'
      }}
    >
      {mon && (
        <div>
          $ cd {mon.get('cwd')}
          <br />
          $ {mon.get('command').last()}
        </div>
      )}
      {output ? (
        output.map(item => <Log key={item.get('uid')} item={item} />)
      ) : (
        <div className="blank-slate">no logs</div>
      )}
    </pre>
  </Main>
)

Logs.propTypes = {
  toggleScrollToBottom: PropTypes.func.isRequired,
  output: PropTypes.object,
  mon: PropTypes.object,
  ...Main.propTypes
}
delete Logs.propTypes.children
