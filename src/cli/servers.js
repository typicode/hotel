const fs = require('fs')
const path = require('path')
const chalk = require('chalk')
const tildify = require('tildify')
const mkdirp = require('mkdirp')
const common = require('../common')
const conf = require('../conf')
const request = require('sync-request')

const serversDir = common.serversDir
const serverHost = `http://${conf.host}:${conf.port}`

module.exports = {
  add,
  rm,
  ls
}

function isUrl(str) {
  return /^(http|https):/.test(str)
}

// Converts '_-Some Project_Name--' to 'some-project-name'
function domainify(str) {
  return (
    str
      .toLowerCase()
      // Replace all _ and spaces with -
      .replace(/(_| )/g, '-')
      // Trim - characters
      .replace(/(^-*|-*$)/g, '')
  )
}

function getId(cwd) {
  return domainify(path.basename(cwd))
}

function getServerFile(id) {
  return `${serversDir}/${id}.json`
}

function colorizeIdFromStatus(text, status) {
  // see https://github.com/mafintosh/respawn#api
  switch (status) {
    case 'running':
      return chalk.green(text)
    case 'stopping':
      return chalk.yellow(text)
    case 'stopped':
      return chalk.gray(text)
    case 'crashed':
      return chalk.red(text)
    case 'sleeping':
      return chalk.gray(text)
    default:
      return text
  }
}

function add(param, opts = {}) {
  mkdirp.sync(serversDir)

  const cwd = opts.dir || process.cwd()
  const id = opts.name ? domainify(opts.name) : getId(cwd)

  const file = getServerFile(id)

  let conf = {}

  if (opts.xfwd) {
    conf.xfwd = opts.xfwd
  }

  if (opts.changeOrigin) {
    conf.changeOrigin = opts.changeOrigin
  }

  if (opts.httpProxyEnv) {
    conf.httpProxyEnv = opts.httpProxyEnv
  }

  if (isUrl(param)) {
    conf = {
      target: param,
      ...conf
    }
  } else {
    conf = {
      cwd,
      cmd: param,
      ...conf
    }

    if (opts.o) conf.out = opts.o

    conf.env = {}

    // By default, save PATH env for version managers users
    conf.env.PATH = process.env.PATH

    // Copy other env option
    if (opts.env) {
      opts.env.forEach(key => {
        const value = process.env[key]
        if (value) {
          conf.env[key] = value
        }
      })
    }

    // Copy port option
    if (opts.port) {
      conf.env.PORT = opts.port
    }
  }

  const data = JSON.stringify(conf, null, 2)

  console.log(`Create ${tildify(file)}`)
  fs.writeFileSync(file, data)

  // if we're mapping a domain to a URL there's no additional info to output
  if (conf.target) return

  // if we're mapping a domain to a local server add some info
  if (conf.out) {
    const logFile = tildify(path.resolve(conf.out))
    console.log(`Output ${logFile}`)
  } else {
    console.log("Output No log file specified (use '-o app.log')")
  }

  if (!opts.p) {
    console.log("Port Random port (use '-p 1337' to set a fixed port)")
  }
}

function rm(opts = {}) {
  const cwd = process.cwd()
  const id = opts.n || getId(cwd)
  const file = getServerFile(id)

  console.log(`Remove  ${tildify(file)}`)
  if (fs.existsSync(file)) {
    fs.unlinkSync(file)
    console.log('Removed')
  } else {
    console.log('No such file')
  }
}

function ls(opts = {}) {
  mkdirp.sync(serversDir)
  let servers
  try {
    // load from the API
    const serverJSON = JSON.parse(
      request('GET', `${serverHost}/_/servers`).getBody('utf-8')
    )
    servers = Object.keys(serverJSON).map(key => [key, serverJSON[key]])
    servers.forEach(([k, server]) => {
      if (server.command) {
        server.cmd = server.command[server.command.length - 1]
      }
    })
  } catch (e) {
    console.error(
      chalk.gray(
        'Could not load data from the API. Server status unavailable.\n'
      )
    )
    // load from the config files
    // no status available
    servers = fs
      .readdirSync(serversDir)
      .map(file => {
        const id = path.basename(file, '.json')
        const serverFile = getServerFile(id)
        let server

        try {
          server = JSON.parse(fs.readFileSync(serverFile))
        } catch (error) {
          // Ignore mis-named or malformed files
          return
        }

        return [id, server]
      })
      .filter(x => x)
  }

  const list = servers
    .map(([id, server]) => {
      let lines = []
      if (server.cmd) {
        lines = [
          colorizeIdFromStatus(chalk.bold(id), server.status) +
            (server.status ? chalk.gray(` (${server.status})`) : ''),
          '$ cd ' + tildify(server.cwd),
          '$ ' + server.cmd,
          server.pid && `PID: ${server.pid}`
        ]
      } else {
        lines = ['🔗 ' + chalk.bold(id), '→ ' + server.target]
      }
      lines = lines.filter(x => x)
      if (opts.verbose) {
        return lines.join('\n  ')
      } else {
        return lines[0]
      }
    })
    .filter(item => item)
    .join(opts.verbose ? '\n\n' : '\n')

  console.log(list)
}
