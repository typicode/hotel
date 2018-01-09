import * as ansi2HTML from 'ansi2html'
import * as escapeHTML from 'escape-html'

function blankLine(val) {
  return val.trim() === '' ? '&nbsp;' : val
}

export function formatLines(str) {
  return str
    .replace(/\n$/, '')
    .split('\n')
    .map(blankLine)
    .map(ansi2HTML)
    .map(escapeHTML)
}

export function statusTitle(monitor) {
  return monitor.pid
    ? `PID ${monitor.pid}\nStarted since ${new Date(
        monitor.started
      ).toLocaleString()}`
    : ''
}

export function href(id) {
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
