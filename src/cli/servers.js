const fs = require('fs')
const path = require('path')
const chalk = require('chalk')
const tildify = require('tildify')
const mkdirp = require('mkdirp')
const common = require('../common')

const serversDir = common.serversDir

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

function ls() {
  mkdirp.sync(serversDir)

  const list = fs
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

      if (server.cmd) {
        return `${id}\n${chalk.gray(tildify(server.cwd))}\n${chalk.gray(
          server.cmd
        )}`
      } else {
        return `${id}\n${chalk.gray(server.target)}`
      }
    })
    .filter(item => item)
    .join('\n\n')

  console.log(list)
}
