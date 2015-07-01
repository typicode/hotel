let fs = require('fs')
let mkdirp = require('mkdirp')
let untildify = require('untildify')
let spawn = require('./spawn')

let dir = untildify('~\\AppData\\Roaming\\Microsoft\\Windows\\Start Menu\\Programs\\Startup')

export function getFile (name) {
  return `${dir}\\${name}.vbs`
}

export function create (name, cmd, args, out) {
  let file = getFile(name)

  let escapedCmd = `""${cmd}""`
  let escapedArgs = args.map(a => `""${a}""`).join(' ')
  let escapedOut = `""${out}""`

  let command = `""${escapedCmd} ${escapedArgs} > ${escapedOut}""`

  let data = `CreateObject("Wscript.Shell").Run "cmd /c ${command}", 0, true`

  mkdirp.sync(dir)
  fs.writeFileSync(file, data)

  spawn(cmd, args, out)
}

export function remove (name) {
  let file = getFile(name)
  if (fs.existsSync(file)) fs.unlinkSync(file)
}
