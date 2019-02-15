import * as ansi2HTML from 'ansi2html'
import * as escapeHTML from 'escape-html'
import { IMonitor } from './Store'

const URL_REGEXP = /(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/

function blankLine(val: string) {
  return val.trim() === '' ? '&nbsp;' : val
}

function addLinks(str: string) {
  return str.replace(URL_REGEXP, (match) => `<a href=${match}>${match}</a>`)
}

export function formatLines(str: string): string[] {
  return str
    .replace(/\n$/, '')
    .split('\n')
    .map(escapeHTML)
    .map(blankLine)
    .map(addLinks)
    .map(ansi2HTML)
}

export function statusTitle(monitor: IMonitor) {
  return monitor.pid
    ? `PID ${monitor.pid}\nStarted since ${new Date(
      monitor.started
    ).toLocaleString()}`
    : ''
}
