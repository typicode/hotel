import * as React from 'react'
import './index.css'

export interface IProps {
  onClick?: () => void
  checked?: boolean
}

function Switch({ onClick = () => null, checked }: IProps) {
  return (
    <label className="switch">
      <input
        type="checkbox"
        onClick={e => {
          e.stopPropagation()
          onClick()
        }}
        checked={checked}
      />
      <span className="slider" />
    </label>
  )
}

export default Switch
