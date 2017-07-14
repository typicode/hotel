const fs = require('fs')
const path = require('path')
const mkdirp = require('mkdirp')
const chokidar = require('chokidar')
const log = require('./log')
const common = require('../common')

function getId(file) {
  return path.basename(file, '.json')
}

function handleAdd(group, file) {
  log(`${file} added`)
  const id = getId(file)

  try {
    const conf = JSON.parse(fs.readFileSync(file, 'utf8'))
    group.add(id, conf)
  } catch (err) {
    log(`Error: Failed to parse ${file}`, err)
  }
}

function handleUnlink(group, file, cb) {
  log(`${file} unlinked`)
  const id = getId(file)
  group.remove(id, cb)
}

function handleChange(group, file) {
  log(`${file} changed`)
  handleUnlink(group, file, () => {
    handleAdd(group, file)
  })
}

module.exports = (group, opts = { watch: true }) => {
  const dir = common.serversDir

  // Ensure directory exists
  mkdirp.sync(dir)

  // Watch ~/.hotel/servers
  if (opts.watch) {
    log(`Watching ${dir}`)
    chokidar
      .watch(dir)
      .on('add', file => handleAdd(group, file))
      .on('change', file => handleChange(group, file))
      .on('unlink', file => handleUnlink(group, file))
  }

  // Bootstrap
  fs.readdirSync(dir).forEach(file => {
    handleAdd(group, path.resolve(dir, file))
  })
}
