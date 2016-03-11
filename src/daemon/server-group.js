// Read, watch and manage servers
const os = require('os')
const fs = require('fs')
const path = require('path')
const util = require('util')
const chokidar = require('chokidar')
const regroup = require('respawn-group')
const getPort = require('get-port')
const mkdirp = require('mkdirp')
const unquote = require('unquote')
const common = require('../common')

// Path
const serversDir = common.serversDir

// Return monitor id
function getId (file) {
  return path.basename(file, '.json')
}

// Return cross-platform command
function getCommand (cmd) {
  if (os.platform() === 'win32') {
    return ['cmd', '/c'].concat(cmd.split(' '))
  } else {
    return ['sh', '-c'].concat(unquote(cmd))
  }
}

// Add server to group
function addServer (group, file) {
  let server = JSON.parse(fs.readFileSync(file, 'utf8'))
  let id = getId(file)
  getPort().then(port => {
    process.env.PORT = port
    let opts = {
      cwd: server.cwd,
      env: Object.assign({}, process.env, server.env)
    }

    util.log(`Add server id: ${id} cmd: ${opts.cmd} port: ${opts.env.PORT}`)

    let logFile
    if (server.out) {
      logFile = path.resolve(server.cwd, server.out)
    }

    let mon = group.add(id, getCommand(server.cmd), opts)

    // On start reset logfile and mon.tail
    let onStart = () => {
      mon.tail = ''

      if (logFile) {
        fs.unlink(logFile, err => { if (err) util.log(err.message) })
      }
    }

    // On output write to logfile and to mon.tail
    let onOutput = (data) => {
      mon.tail = mon.tail
        .concat(data)
        .split('\n')
        .slice(-100)
        .join('\n')

      if (logFile) {
        fs.appendFile(logFile, data, err => { if (err) util.log(err.message) })
      }
    }

    mon
      .on('start', onStart)
      .on('stdout', onOutput)
      .on('stderr', onOutput)

    group.emit('change')
  })
}

// Update server
function updateServer (group, file) {
  addServer(group, file)
  group.restart(getId(file))
}

// Remove server
function removeServer (group, file) {
  group.remove(getId(file))
  group.emit('change')
}

module.exports = (watch = true) => {
  // Create dir
  mkdirp.sync(serversDir)

  let group = regroup({
    maxRestarts: 0
  })

  // Add change event
  for (let monEvent of ['start', 'restart', 'stop']) {
    group.on(monEvent, () => group.emit('change'))
  }

  // Log monitors events
  group
    .on('start', (mon) => util.log(mon.id, 'has started'))
    .on('restart', (mon) => util.log(mon.id, 'is being restarted'))
    .on('stop', (mon) => util.log(mon.id, 'has stopped'))
    .on('warn', (mon, err) => util.log(mon.id, err))

  // Watch ~/.hotel/servers
  util.log(`Watching ${serversDir}`)

  if (watch) {
    chokidar.watch(serversDir)
      .on('add', (file) => {
        util.log(`Created ${file}`)
        addServer(group, file)
      })
      .on('change', (file) => {
        util.log(`Changed ${file}`)
        updateServer(group, file)
      })
      .on('unlink', (file) => {
        util.log(`Removed ${file}`)
        removeServer(group, file)
      })
  }

  // Add servers
  let files = fs.readdirSync(serversDir)
  for (let file of files) {
    addServer(group, `${serversDir}/${file}`)
  }

  return group
}
