const fs = require('fs')
const path = require('path')
const mock = require('mock-fs')
const test = require('ava')
const config = require('../../src/cli/config')

mock()
const file = path.join(process.cwd(), '.hotelrc')

test('config with cmd', (t) => {
  fs.writeFileSync(file, JSON.stringify({
    cmd: 'cmd',
    out: 'out',
    port: '9000'
  }))

  t.deepEqual(config(), ['cmd', '--out', 'out', '--port', '9000'])
})

test('config with url', (t) => {
  fs.writeFileSync(file, JSON.stringify({
    url: 'url'
  }))

  t.deepEqual(config(), ['url'])
})
