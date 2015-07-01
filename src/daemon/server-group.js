// Read, watch and manage servers
let os = require('os')
let fs = require('fs')
let path = require('path')
let util = require('util')
let chokidar = require('chokidar')
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
  getPort((err, port) => {
    if (err) throw err

    util.log(`Add server id: ${id} cmd: ${server.cmd} port: ${port}`)

    process.env.PORT = port
    let opts = {
      cwd: server.cwd,
      env: extend(process.env, server.env)
    }

    let logFile
    if (server.out) {
      logFile = path.resolve(server.cwd, server.out)
    }

    let mon = group.add(id, getCommand(server.cmd), opts)

    // On start reset logfile and mon.tail
    let onStart = () => {
      mon.tail = ''

      if (logFile) {
        fs.unlink(logFile, (e) => { if (e) util.log(e.message) })
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
        fs.appendFile(logFile, data, (e) => { if (e) util.log(e.message) })
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

export default function () {
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

  // During tests don't bother about CPU and make chokidar super fast
  let opts = {}
  if (process.env.NODE_ENV === 'test') {
    opts.usePolling = true
    opts.interval = 25
  }

  chokidar.watch(serversDir, opts)
    .on('add', (file) => {
      util.log(`created ${file}`)
      addServer(group, file)
    })
    .on('change', (file) => {
      util.log(`changed ${file}`)
      updateServer(group, file)
    })
    .on('unlink', (file) => {
      util.log(`removed ${file}`)
      removeServer(group, file)
    })

  // Add servers
  let files = fs.readdirSync(serversDir)
  for (let file of files) {
    addServer(group, `${serversDir}/${file}`)
  }

  return group
}
