const fs = require('fs')
const path = require('path')
const tildify = require('tildify')
const mkdirp = require('mkdirp')
const common = require('../common')

const serversDir = common.serversDir

module.exports = {
  add,
  rm,
  ls
}

// Converts '_-Some Project_Name--' to 'some-project-name'
function domainize (str) {
  return str
    .toLowerCase()
    // Replace all _ and spaces with -
    .replace(/(_| )/g, '-')
    // Trim - characters
    .replace(/(^-*|-*$)/g, '')
}

function getId (cwd) {
  return domainize(path.basename(cwd))
}

function getServerFile (id) {
  return `${serversDir}/${id}.json`
}

function add (cmd, opts = {}) {
  mkdirp.sync(serversDir)

  const cwd = opts.d || process.cwd()
  const id = opts.n || getId(cwd)
  const file = getServerFile(id)
  const obj = { cwd, cmd }

  if (opts.o) obj.out = opts.o

  obj.env = {}

  // By default, save PATH env for version managers users
  obj.env.PATH = process.env.PATH

  // Copy other env option
  if (opts.e && process.env[opts.e]) {
    obj.env[opts.e] = process.env[opts.e]
  }

  // Copy port option
  if (opts.p) {
    obj.env.PORT = opts.p
  }

  const data = JSON.stringify(obj, null, 2)

  console.log(`Create ${tildify(file)}`)
  fs.writeFileSync(file, data)

  if (obj.out) {
    const logFile = tildify(path.resolve(obj.out))
    console.log(`Output ${logFile}`)
  } else {
    console.log('Output No log file specified (use \'-o app.log\')')
  }
}

function rm (name) {
  const id = getId(name)
  const file = getServerFile(id)

  console.log(`Remove  ${tildify(file)}`)
  if (fs.existsSync(file)) {
    fs.unlinkSync(file)
    console.log('Removed')
  } else {
    console.log('No such file')
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
      return `${id} - ${server.cwd}\n${server.cmd}`
    })
    .join('\n\n')

  console.log(list)
}
