const fs = require('fs')
const path = require('path')
const chalk = require('chalk')
const tildify = require('tildify')
const mkdirp = require('mkdirp')
const common = require('../common')
const daemonConf = require('../conf')

const serversDir = common.serversDir

module.exports = {
  add,
  rm,
  ls
}

function isUrl (str) {
  return /^(http|https):/.test(str)
}

// Converts '_-Some Project_Name--' to 'some-project-name'
function domainify (str) {
  return str
    .toLowerCase()
    // Replace all _ and spaces with -
    .replace(/(_| )/g, '-')
    // Trim - characters
    .replace(/(^-*|-*$)/g, '')
}

function getId (cwd) {
  return domainify(path.basename(cwd))
}

function getServerFile (id) {
  return `${serversDir}/${id}.json`
}

function add (param, opts = {}) {
  mkdirp.sync(serversDir)

  const cwd = opts.d || process.cwd()
  const id = opts.n || getId(cwd)
  const file = getServerFile(id)

  console.log(chalk.cyan.bold(`http://${id}.${daemonConf.tld}`))
  console.log(chalk.cyan(`http://localhost:${daemonConf.port}/${id}`))
  console.log()

  let conf
  if (isUrl(param)) {
    conf = {
      target: param
    }
  } else {
    conf = {
      cwd,
      cmd: param
    }

    if (opts.o) conf.out = opts.o

    conf.env = {}

    // By default, save PATH env for version managers users
    conf.env.PATH = process.env.PATH

    // Copy other env option
    if (opts.e) {
      opts.e.forEach((key) => {
        const value = process.env[key]
        if (value) {
          conf.env[key] = value
        }
      })
    }

    // Copy port option
    if (opts.p) {
      conf.env.PORT = opts.p
    }
  }

  const data = JSON.stringify(conf, null, 2)

  console.log(chalk.gray(`Config ${tildify(file)}`))
  fs.writeFileSync(file, data)

  // if we're mapping a domain to a URL there's no additional info to output
  if (conf.target) return

  // if we're mapping a domain to a local server add some info
  if (conf.out) {
    const logFile = tildify(path.resolve(conf.out))
    console.log(chalk.gray(`Output ${logFile}`))
  } else {
    console.log(chalk.gray('Output No log file specified (use \'-o app.log\')'))
  }

  if (!opts.p) {
    console.log(chalk.gray('Port   Random port (use \'-p 1337\' to set a fixed port)'))
  }

  console.log()
  console.log(chalk.gray(`To configure .dev domains`))
  console.log(chalk.gray(`See https://github.com/typicode/hotel/blob/master/docs/README.md`))
}

function rm (opts = {}) {
  const cwd = process.cwd()
  const id = opts.n || getId(cwd)
  const file = getServerFile(id)

  if (fs.existsSync(file)) {
    fs.unlinkSync(file)
  } else {
    console.log(chalk.gray(`Can't find ${tildify(file)}`))
  }
}

function ls () {
  mkdirp.sync(serversDir)

  const list = fs
    .readdirSync(serversDir)
    .map((file) => {
      const id = path.basename(file, '.json')
      const serverFile = getServerFile(id)
      const server = JSON.parse(fs.readFileSync(serverFile))

      const arr = [
        chalk.bold(id),
        chalk.cyan.bold(`http://${id}.${daemonConf.tld}`),
        chalk.cyan(`http://localhost:${daemonConf.port}/${id}`)
      ]

      if (server.cmd) {
        return arr.concat([
          chalk.gray('Dir', tildify(server.cwd)),
          chalk.gray('Cmd', server.cmd)
        ]).join('\n')
      } else {
        return arr.concat([
          chalk.gray('Target', server.target)
        ]).join('\n')
      }
    })
    .join('\n\n')

  console.log(list)
}
