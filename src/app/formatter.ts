import * as ansi2HTML from 'ansi2html'
import * as escapeHTML from 'escape-html'
import { IMonitor } from './Store'

export function formatLine(str: string): string {
  return ansi2HTML(escapeHTML(str))
}

export function statusTitle(monitor: IMonitor) {
  return monitor.pid
    ? `PID ${monitor.pid}\nStarted since ${new Date(
        monitor.started
      ).toLocaleString()}`
    : ''
}
