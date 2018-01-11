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
  className?: string,
  id: string,
  name: string
}

export default function Link({ className, id, name }: IProps) {
  return (
    <a className={className} href={href(id)} target="_blank" onClick={e => e.stopPropagation()}>
      {name}
    </a>
  )
}
