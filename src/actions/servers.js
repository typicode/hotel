let fs = require('fs')
let path = require('path')
let tildify = require('tildify')
let mkdirp = require('mkdirp')
let common = require('../common')
let conf = require('../conf')

module.exports = {
  add,
  rm,
  ls
}

let serversDir = common.serversDir

mkdirp.sync(serversDir)

function getId (name) {
  return name || path.basename(process.cwd())
}

function getServerFile (id) {
  return `${serversDir}/${id}.json`
}

function add (cmd, opts) {
  let id = getId(opts.n)
  let file = getServerFile(id)
  let obj = {
    cwd: process.cwd(),
    cmd: cmd
  }

  if (opts.o) obj.out = opts.o

  obj.env = {}

  // By default, save PATH env for version managers users
  obj.env.PATH = process.env.PATH

  if (opts.e && process.env[opts.e]) {
    obj.env[opts.e] = process.env[opts.e]
  }

  let data = JSON.stringify(obj, null, 2)

  console.log(`  Create ${tildify(file)}`)
  fs.writeFileSync(file, data)

  console.log(`  Added  http://localhost:${conf.port}/${id}`)

  if (!obj.out) {
    console.log(`  Warn   No log file specified. Output will be discarded.`)
    console.log(`         Use '-o log.txt' to specify a logfile.`)
  }
}

function rm (name) {
  let id = getId(name)
  let file = getServerFile(id)

  console.log(`  Remove  ${tildify(file)}`)
  console.log(`  Removed`)

  fs.unlink(file, function () {})
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
