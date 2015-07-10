let fs = require('fs')
let mkdirp = require('mkdirp')
let untildify = require('untildify')
let spawn = require('./spawn')

let dir = untildify('~/.config/autostart')

function spawn (cmd, args, out) {
  let fd = fs.openSync(out, 'w')
  cp.spawn(cmd, args, {
      stdio: ['ignore', fd, fd],
      detached: true
    })
    .on('error', console.log)
    .unref()
}

export function getFile (name) {
  return `${dir}/${name}.desktop`
}

export function create (name, cmd, args, out) {
  let file = getFile(name)

  let data = [
    '[Desktop Entry]',
    'Type=Application',
    'Vestion=1.0',
    'Name=${name}',
    `Comment=${name} startup script`,
    `Exec=${cmd} ${args} > ${out}`,
    'StartupNotify=false',
    'Terminal=false'
  ].join('\n')

  mkdirp.sync(dir)
  fs.writeFileSync(file, data)

  spawn(cmd, args, out)
}

export function remove (name) {
  let file = getFile(name)
  if (fs.existsSync(file)) fs.unlinkSync(file)
}
