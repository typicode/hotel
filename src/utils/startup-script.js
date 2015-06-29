let os = require('os')
let fs = require('fs')
let cp = require('child_process')
let path = require('path')
let mkdirp = require('mkdirp')
let untildify = require('untildify')

module.exports = {
  getFile,
  create,
  remove
}

let platform = os.platform()

function getFile (name) {
  return {
    linux: untildify(`~/.config/autostart/${name}.desktop`),
    darwin: untildify(`~/Library/LaunchAgents/${name}.plist`),
    win32: untildify(`~/AppData\\Roaming\\Microsoft\\Windows\\Start Menu\\Programs\\Startup\\${name}.vbs`)
  }[platform]
}

function getData (name, cmd, args, out) {
  // Linux
  if (platform === 'linux') {

    // Join args
    args = args.join(' ')

    return `[Desktop Entry]
Type=Application
Vestion=1.0
Name=${name}
Comment=${name} startup script
Exec=${cmd} ${args} > ${out}
StartupNotify=false
Terminal=false
`
  }

  // Darwin
  if (platform === 'darwin') {

    // Turn command and args to XML
    let array = [cmd].concat(args)
      .split(' ')
      .map(item => `<string>${item}</string>`)
      .join('\n')

    return `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>Label</key>
  <string>${name}</string>
  <key>ProgramArguments</key>
  <array>
      ${array}
  </array>
  <key>RunAtLoad</key>
  <true/>
  <key>StandardOutPath</key>
  <string>${out}</string>
  <key>StandardErrorPath</key>
  <string>${out}</string>
</dict>
</plist>
`
  }

  // Windows
  if (platform === 'win32') {

    // Escape command and args
    cmd = `""${cmd}""`
    args = args.map(a => `""${a}""`).join(' ')
    out = `""${out}""`

    return `CreateObject("Wscript.Shell").Run "${cmd} ${args} > ${out}", 0, true
`
  }

  throw new Error(`Unsupported platform (${platform})`)
}

function create (name, cmd, args, out) {
  let file = getFile(name)
  let data = getData(name, cmd, args, out)

  mkdirp.sync(path.dirname(file))
  fs.writeFileSync(file, data)

  if (platform === 'darwin') {
    cp.execSync(`launchctl load -Fw ${file}`)
  }
}

function remove (name) {
  let file = getFile(name)

  if (fs.existsSync(file)) fs.unlinkSync(file)

  if (platform === 'darwin') {
    cp.execSync(`launchctl unload ${file}`)
  }
}
