import * as uniqueId from 'lodash.uniqueid'
import { action, computed, observable } from 'mobx'
import * as api from './api'
import { formatLines } from './formatter'

export interface IProxy {
  target: string
}

export interface ILine {
  id: string
  html: string
}

export interface IMonitor {
  cwd: string
  command: string[]
  status: string
  output: ILine[]
  started: Date
  pid: number
}

export const RUNNING = 'running'
export const STOPPED = 'stopped'
const MAX_OUTPUT_LENGTH = 1000

function clear(servers: Map<string, IMonitor | IProxy>, data: any) {
  servers.forEach((server, id) => {
    if (!data.hasOwnProperty(id)) {
      servers.delete(id)
    }
  })
}

export default class Store {
  @observable public isLoading: boolean = true
  @observable public selectedMonitorId: string = ''
  @observable public monitors: Map<string, IMonitor> = new Map()
  @observable public proxies: Map<string, IProxy> = new Map()

  constructor() {
    this.watchServers()
    this.watchOutput()
  }

  @action
  public watchServers() {
    api.watchServers(data => {
      // Delete servers that do not exist anymore in Hotel
      clear(this.monitors, data)
      clear(this.proxies, data)

      // Create or update servers
      Object.keys(data).forEach(id => {
        const server = data[id]
        if (this.monitors.has(id) || this.proxies.has(id)) {
          // Update server state
          if (server.hasOwnProperty('status')) {
            Object.assign(this.monitors.get(id), server)
          } else {
            Object.assign(this.proxies.get(id), server)
          }
        } else {
          // Create new server
          if (server.hasOwnProperty('status')) {
            server.output = []
            this.monitors.set(id, server)
          } else {
            this.proxies.set(id, server)
          }
        }
      })

      // Initial data has been loaded
      this.isLoading = false
    })
  }

  @action
  public watchOutput() {
    api.watchOutput(data => {
      const { id, output } = data
      const lines = formatLines(output).map(html => ({
        html,
        id: uniqueId()
      }))

      lines.forEach(line => {
        const monitor = this.monitors.get(id)
        if (monitor) {
          monitor.output.push(line)

          if (monitor.output.length > MAX_OUTPUT_LENGTH) {
            monitor.output.shift()
          }
        }
      })
    })
  }

  @action
  public selectMonitor(monitorId: string) {
    this.selectedMonitorId =
      this.selectedMonitorId === monitorId ? '' : monitorId
  }

  @action
  public toggleMonitor(monitorId: string) {
    const monitor = this.monitors.get(monitorId)

    if (monitor) {
      if (monitor.status === RUNNING) {
        api.stopMonitor(monitorId)
        monitor.status = STOPPED // optimistic update
      } else {
        api.startMonitor(monitorId)
        monitor.status = RUNNING
      }
    }
  }

  @action
  public clearOutput(monitorId: string) {
    const monitor = this.monitors.get(monitorId)
    if (monitor) {
      monitor.output = []
    }
  }
}
