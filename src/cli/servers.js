const fs = require('fs')
const path = require('path')
const chalk = require('chalk')
const tildify = require('tildify')
const mkdirp = require('mkdirp')
const inquirer = require('inquirer')
const opn = require('opn')
const { serversDir, getServerFile } = require('../common')
const api = require('./api')

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

function getCurrentApp(servers) {
  const currentCwd = fs.realpathSync(process.cwd())
  const serverNames = servers
    .filter(([id, { cwd }]) => cwd) // remove proxies
    .map(([id, { cwd }]) => [id, fs.realpathSync(cwd)])
  const exactMatch = serverNames.filter(([id, cwd]) => cwd === currentCwd)
  const parents = serverNames.filter(([id, cwd]) =>
    /^(\.\.[\\/])*\.\.$/.test(path.relative(currentCwd, cwd))
  )

  if (exactMatch.length) {
    return exactMatch
  } else if (parents.length) {
    const minLength = parents
      .map(([id, cwd]) => path.relative(currentCwd, cwd).length)
      .reduce((a, b) => Math.min(a, b))

    return parents.filter(
      ([id, cwd]) => path.relative(currentCwd, cwd).length === minLength
    )
  }
  return []
}

// NOTE: Returns a `Promise`
function acquireAppName(hint) {
  const servers = api
    .getServerList()
    .servers.filter(([id, server]) => server.cmd)
  let results = []
  if (hint) {
    results = servers.filter(([id]) => id.includes(hint))
    if (!results.length) {
      console.error(
        chalk.red(chalk`Could not find app matching {underline.bold ${hint}}`)
      )
    }
  } else {
    results = getCurrentApp(servers)
    console.error(chalk.yellow('Could not find an app for this directory'))
  }

  if (!results.length) results = servers
  if (results.length === 1) {
    return Promise.resolve(results[0][0])
  } else {
    return inquirer
      .prompt([
        {
          type: 'list',
          name: 'appName',
          message: 'Please select an app:',
          choices: results.map(([id]) => id)
        }
      ])
      .then(result => result.appName)
      .catch(err => console.error('Thing failed\n' + chalk.gray(err.stack)))
  }
}

function logStack(err) {
  console.error(chalk.red('ERR! ') + err.message)
  console.error(
    chalk.gray(err.stack.replace('Error: ' + err.message + '\n', ''))
  )
}

function withAppName(cb) {
  return ({ search }) =>
    acquireAppName(search)
      .then(name => {
        if (!name) return
        cb(name)
      })
      .catch(logStack)
}

/*
 *  ██████  ██████  ███    ███ ███    ███  █████  ███    ██ ██████  ███████
 * ██      ██    ██ ████  ████ ████  ████ ██   ██ ████   ██ ██   ██ ██
 * ██      ██    ██ ██ ████ ██ ██ ████ ██ ███████ ██ ██  ██ ██   ██ ███████
 * ██      ██    ██ ██  ██  ██ ██  ██  ██ ██   ██ ██  ██ ██ ██   ██      ██
 *  ██████  ██████  ██      ██ ██      ██ ██   ██ ██   ████ ██████  ███████
 */

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
  const { servers, fromApi } = api.getServerList()
  if (!fromApi) {
    console.error(
      chalk.gray(
        'Could not load data from the API. Server status unavailable.\n'
      )
    )
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

  console.log(list + '\n')
}

const up = withAppName(name => {
  api.server(name).start()
  console.log(chalk`Started {bold ${name}}.`)
})

const down = withAppName(name => {
  api.server(name).start()
  console.log(chalk`Stopped {bold ${name}}.`)
})

const open = withAppName(name => {
  opn(`${api.host}/${name}`, {
    wait: false // don’t wait for the tab to be closed before returning
  })
  console.log(chalk`Opening {bold ${name}}...`)
})

module.exports = {
  add,
  rm,
  ls,
  up,
  down,
  open
}
