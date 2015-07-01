let fs = require('fs')
let cp = require('child_process')
let mkdirp = require('mkdirp')
let untildify = require('untildify')
let spawn = require('./spawn')

let dir = untildify(`~/Library/LaunchAgents`)

export function getFile (name) {
  return `${dir}/${name}.plist`
}

export function create (name, cmd, args, out) {
  let array = [cmd]
    .concat(args)
    .map(a => `    <string>${a}</string>`)
    .join('\n')

  let file = getFile(name)

  let data = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">',
    '<plist version="1.0">',
    '<dict>',
    '  <key>Label</key>',
    `  <string>${name}</string>`,
    '  <key>ProgramArguments</key>',
    '  <array>',
         array,
    '  </array>',
    '  <key>RunAtLoad</key>',
    '  <true/>',
    '  <key>StandardOutPath</key>',
    `  <string>${out}</string>`,
    '  <key>StandardErrorPath</key>',
    `  <string>${out}</string>`,
    '</dict>',
    '</plist>'
  ].join('\n')

  mkdirp.sync(dir)
  fs.writeFileSync(file, data)

  spawn(cmd, args, out)
}

export function remove (name) {
  let file = getFile(name)
  if (fs.existsSync(file)) fs.unlinkSync(file)
  try {
    cp.execSync(`launchctl remove ${name}`)
  } catch (e) {}
}
