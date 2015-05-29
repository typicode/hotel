let fs = require('fs')
let path = require('path')
let tildify = require('tildify')
let mkdirp = require('mkdirp')
let common = require('../common')

module.exports = {
  add,
  rm,
  ls
}

let serversDir = common.serversDir

mkdirp.sync(serversDir)

function getId (id) {
  return id || path.basename(process.cwd())
}

function getServerFile (id) {
  return `${serversDir}/${getId(id)}.json`
}

function add (cmd, opts) {
  let file = getServerFile(opts.n)
  let obj = {
    cmd: cmd,
    cwd: process.cwd()
  }

  if (opts.o) obj.out = opts.o
  if (opts.e && process.env[opts.e]) {
    obj.env = {}
    obj.env[opts.e] = process.env[opts.e]
  }

  console.log(`Create ${file}`)
  let data = JSON.stringify(obj)
  fs.writeFileSync(file, data)
}

function rm (id) {
  fs.unlink(getServerFile(id), function () {})
}

function ls () {
  let files = fs.readdirSync(serversDir)
  for (let file of files) {
    let id = path.basename(file, '.json')
    let serverFile = getServerFile(id)
    let server = JSON.parse(fs.readFileSync(serverFile))
    console.log(`${id} - ${tildify(server.cwd)} - ${server.cmd}`)
  }
}
