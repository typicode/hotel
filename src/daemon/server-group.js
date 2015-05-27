/*
 * Read, watch and manage servers
 */
let os = require('os')
let fs = require('fs')
let path = require('path')
let watch = require('watch')
let regroup = require('respawn-group')
let extend = require('xtend')
let getPort = require('get-port')
let mkdirp = require('mkdirp')
let unquote = require('unquote')
let common = require('../common')

// Path
let serversDir = common.serversDir

// Create dir
mkdirp.sync(serversDir)

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
  getPort(function (err, port) {
    if (err) throw err

    console.log(`Add server id: ${id} cmd: ${server.cmd} port: ${port}`)

    process.env.PORT = port
    let opts = {
      cwd: server.cwd,
      env: extend(process.env, server.env)
    }

    if (server.out) {
      try {
        let logFile = path.resolve(server.cwd, server.out)
        console.log(`Open ${logFile}`)
        let out = fs.openSync(logFile, 'w')
        opts.stdio = ['ignore', out, out]
      } catch (e) {
        return console.log(e)
      }
    }

    group.add(id, getCommand(server.cmd), opts)
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
}

module.exports = function () {
  let group = regroup({
    maxRestarts: 0
  })

  // Add change event
  for (let monEvent of ['start', 'restart', 'stop']) {
    group.on(monEvent, function () {
      group.emit('change')
    })
  }

  // Log monitors events
  group
    .on('start', (mon) => {
      console.log(mon.id, 'has started')
    })
    .on('restart', (mon) => {
      console.log(mon.id, 'is being restarted')
    })
    .on('stop', (mon) => {
      console.log(mon.id, 'has stopped')
    })
    .on('warn', (mon, err) => {
      console.log(mon.id, err)
    })
    .on('stderr', (mon, data) => {
      console.log(mon.id, data.toString())
    })

  // Watch ~/.hotel/servers
  console.log(`Watching ${serversDir}`)
  watch.createMonitor(serversDir, function (monitor) {
    monitor
      .on('created', (file) => {
        console.log('created', file)
        addServer(group, file)
      })
      .on('changed', (file) => {
        console.log('changed', file)
        updateServer(group, file)
      })
      .on('removed', (file) => {
        console.log('removed', file)
        removeServer(group, file)
      })
  })

  // Add servers
  let files = fs.readdirSync(serversDir)
  for (let file of files) {
    addServer(group, `${serversDir}/${file}`)
  }

  return group
}
