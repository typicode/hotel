const fs = require('fs')
const path = require('path')
const util = require('util')
const mkdirp = require('mkdirp')
const chokidar = require('chokidar')
const common = require('../common')

function _parse (file) {
  return {
    id: path.basename(file, '.json'),
    conf: JSON.parse(fs.readFileSync(file, 'utf8'))
  }
}

function handleAdd (group, file) {
  util.log(`${file} added`)
  const { id, conf } = _parse(file)
  group.add(id, conf)
}

function handleUnlink (group, file) {
  util.log(`${file} unlinked`)
  const { id } = _parse(file)
  group.remove(id)
}

function handleChange (group, file) {
  util.log(`${file} changed`)
  handleAdd(group, file)
  handleUnlink(group, file)
}

module.exports = (group, opts = { watch: true }) => {
  const dir = common.serversDir

  // Ensure directory exists
  mkdirp.sync(dir)

  // Watch ~/.hotel/servers
  if (opts.watch) {
    util.log(`Watching ${dir}`)
    chokidar
      .watch(dir)
      .on('add', (file) => handleAdd(group, file))
      .on('change', (file) => handleChange(group, file))
      .on('unlink', (file) => handleUnlink(group, file))
  }

  // Bootstrap
  fs.readdirSync(dir).forEach((file) => {
    handleAdd(group, path.resolve(dir, file))
  })
}
