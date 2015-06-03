let os = require('os')
let fs = require('fs')
let cp = require('child_process')
let path = require('path')
let mkdirp = require('mkdirp')
let tildify = require('tildify')
let untildify = require('untildify')

module.exports = {
  create,
  remove
}

let execPath = process.execPath
let daemonFile = `${__dirname}/../daemon`

let binFile = path.resolve(`${__dirname}/../../bin`)
let logFile = untildify('~/.hotel/daemon.log')

let file = {
  linux: untildify('~/.config/autostart/hotel.desktop'),
  darwin: untildify('~/Library/LaunchAgents/hotel.plist'),
  win32: untildify('~/AppData\\Roaming\\Microsoft\\Windows\\Start Menu\\Programs\\Startup\\hotel.vbs')
}

let data = {}

// See http://standards.freedesktop.org/desktop-entry-spec/latest/ar01s05.html
data.linux =
`[Desktop Entry]
Type=Application
Vestion=1.0
Name=Hotel
Comment=Hotel start command
Exec=${execPath} ${binFile} start
StartupNotify=false
Terminal=false
`

data.darwin =
`<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>hotel</string>
    <key>ProgramArguments</key>
    <array>
        <string>${execPath}</string>
        <string>${binFile}</string>
        <string>start</string>
    </array>
    <key>RunAtLoad</key>
    <true/>
    <key>StandardOutPath</key>
    <string>${logFile}</string>
    <key>StandardErrorPath</key>
    <string>${logFile}</string>
</dict>
</plist>
`

data.win32 =
`CreateObject("Wscript.Shell").Run "node ${daemonFile} start", 0, true
`

function create () {
  let platform = os.platform()
  console.log(`  Create  ${tildify(file[platform])}`)

  mkdirp.sync(path.dirname(file[platform]))
  fs.writeFileSync(file[platform], data[platform])

  if (platform === 'darwin') {
    cp.execSync(`launchctl load -Fw ${file[platform]}`)
  }

  console.log('  Created startup script ')
}

function remove () {
  let platform = os.platform()
  console.log(`  Remove  ${tildify(file[platform])}`)

  if (fs.existsSync(file[platform])) fs.unlinkSync(file[platform])

  if (platform === 'darwin') {
    cp.execSync(`launchctl unload ${file[platform]}`)
  }

  console.log('  Removed autostart script')
}
