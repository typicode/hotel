const fs = require('fs')
const path = require('path')
const tildify = require('tildify')
const mkdirp = require('mkdirp')
const common = require('../common')
const conf = require('../conf')

const serversDir = common.serversDir

mkdirp.sync(serversDir)

module.exports = {
  add,
  rm,
  ls
}

function getId (name) {
  return name || path.basename(process.cwd())
}

function getServerFile (id) {
  return `${serversDir}/${id}.json`
}

function add (cmd, opts) {
  let id = getId(opts.n)
  let file = getServerFile(id)
  let cwd = process.cwd()
  let obj = { cwd, cmd }

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

  let data = JSON.stringify(obj, null, 2)

  console.log(`  Create ${tildify(file)}`)
  fs.writeFileSync(file, data)

  if (obj.out) {
    let logFile = tildify(path.resolve(obj.out))
    console.log(`  Output ${logFile}`)
  } else {
    console.log('  Output No log file specified (use \'-o app.log\')')
  }

  console.log(`  Added  http://localhost:${conf.port}/${id}`)
}

function rm (name) {
  let id = getId(name)
  let file = getServerFile(id)

  console.log(`  Remove  ${tildify(file)}`)
  if (fs.existsSync(file)) {
    fs.unlinkSync(file)
    console.log('  Removed')
  } else {
    console.log('  No such file')
  }
}

function ls () {
  let list = fs
    .readdirSync(serversDir)
    .map(file => {
      let id = path.basename(file, '.json')
      let serverFile = getServerFile(id)
      let server = JSON.parse(fs.readFileSync(serverFile))
      return `  ${tildify(server.cwd)}$ ${server.cmd}\n` +
        `  http://localhost:${conf.port}/${id}`
    })
    .join('\n\n')

  console.log(list)
}
