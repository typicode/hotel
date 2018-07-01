import * as React from 'react'
import { IMonitor, IProxy } from '../../Store'

function href(id: string) {
  const { protocol, hostname } = window.location
  if (/hotel\./.test(hostname)) {
    // Accessed using hotel.tld
    const tld = hostname.split('.').slice(-1)[0]
    return `${protocol}//${id}.${tld}`
  } else {
    // Accessed using localhost
    return `/${id}`
  }
}

interface IProps {
  id: string
}

function Link({ id }: IProps) {
  return (
    <a href={href(id)} target="_blank" onClick={e => e.stopPropagation()}>
      {id}
    </a>
  )
}

export default Link
