import * as React from 'react'
import './index.css'

export interface IProps {
  onClick?: () => void
  checked?: boolean
}

function Switch({ onClick = () => null, checked }: IProps) {
  return (
    <label
      className="switch"
      onClick={e => {
        e.stopPropagation()
        e.preventDefault()
        onClick()
      }}
    >
      <input type="checkbox" checked={checked} />
      <span className="slider" />
    </label>
  )
}

export default Switch
