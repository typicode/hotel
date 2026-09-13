import * as React from 'react'
import { IMonitor, IProxy } from '../../Store'

function href(id: string) {
  const { protocol, hostname } = window.location
  if (/hotel\./.test(hostname)) {
    // Accessed using hotel.tld
    // Extract the full TLD after 'hotel.' (e.g., 'demo.dev.example.com' from 'hotel.demo.dev.example.com')
    const hotelIndex = hostname.indexOf('hotel.')
    if (hotelIndex !== -1) {
      const tld = hostname.slice(hotelIndex + 6) // Skip 'hotel.'
      return `${protocol}//${id}.${tld}`
    }
    // Fallback: use last segment only
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
