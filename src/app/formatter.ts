import * as ansi2HTML from 'ansi2html'
import * as escapeHTML from 'escape-html'
import { IMonitor } from './Store'

function blankLine(val: string) {
  return val.trim() === '' ? '&nbsp;' : val
}

export function formatLines(str: string): string[] {
  return str
    .replace(/\n$/, '')
    .split('\n')
    .map(escapeHTML)
    .map(blankLine)
    .map(ansi2HTML)
}

export function statusTitle(monitor: IMonitor) {
  return monitor.pid
    ? `PID ${monitor.pid}\nStarted since ${new Date(
        monitor.started
      ).toLocaleString()}`
    : ''
}
