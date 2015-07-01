let fs = require('fs')
let cp = require('child_process')

export default function (cmd, args, out) {
  let fd = fs.openSync(out, 'w')
  cp.spawn(cmd, args, {
      stdio: ['ignore', fd, fd],
      detached: true
    })
    .on('error', console.log)
    .unref()
}
