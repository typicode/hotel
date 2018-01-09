import React from 'react'
import { startMonitor, stopMonitor } from '../api'
import MonitorItem from '../components/MonitorItem'

function toggle(monitor) {
  if (monitor.status === 'running') {
    stopMonitor(monitor.id)
  } else {
    startMonitor(monitor.id)
  }
}

function MonitorItemContainer({ monitor, onSelect }) {
  return (
    <MonitorItem
      monitor={monitor}
      onToggle={() => toggle(monitor)}
      onSelect={() => onSelect(monitor.id)}
    />
  )
}

export default MonitorItemContainer
