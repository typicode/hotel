const fs = require('fs')
const path = require('path')
const test = require('ava')
const mock = require('mock-fs')
const servers = require('../../src/cli/servers')
const { serversDir } = require('../../src/common')

test.before(() => {
  process.chdir(path.join(__dirname, '../fixtures/app'))
  mock({
    [serversDir]: {}
  })
})

test.afterEach(() => {
  mock.restore()
})

test('add should create file', (t) => {
  servers.add('node index.js')

  const file = path.join(serversDir, 'app.json')
  const conf = {
    cmd: 'node index.js',
    cwd: process.cwd(),
    env: {
      PATH: process.env.PATH
    }
  }

  t.deepEqual(
    JSON.parse(fs.readFileSync(file)),
    conf
  )
})

test('add should create file with URL safe characters by defaults', (t) => {
  servers.add('node index.js', {
    d: '/_-Some Project_Name--'
  })

  const file = path.join(serversDir, 'some-project-name.json')

  t.truthy(fs.existsSync(file))
})

test('add should be possible to force a name', (t) => {
  servers.add('node index.js', {
    n: 'Some Project_Name',
    d: '/Some Project_Name'
  })

  const file = path.join(serversDir, 'Some Project_Name.json')

  t.truthy(fs.existsSync(file))
})

test('add should support options', (t) => {
  process.env.FOO = 'FOO'
  const opts = {
    n: 'project',
    o: '/some/path/out.log',
    e: 'FOO',
    p: 3000
  }
  servers.add('node index.js', opts)

  const file = path.join(serversDir, 'project.json')
  const conf = {
    cmd: 'node index.js',
    cwd: process.cwd(),
    out: opts.o,
    env: {
      PATH: process.env.PATH,
      FOO: process.env.FOO,
      PORT: opts.p
    }
  }

  t.deepEqual(
    JSON.parse(fs.readFileSync(file)),
    conf
  )
})

test('add should support url', (t) => {
  servers.add('http://1.2.3.4')

  const file = path.join(serversDir, 'app.json')
  const conf = {
    target: 'http://1.2.3.4'
  }

  t.deepEqual(
    JSON.parse(fs.readFileSync(file)),
    conf
  )
})

test('rm should remove file', (t) => {
  const app = path.join(serversDir, 'app.json')
  const project = path.join(serversDir, 'project.json')
  servers.rm({})
  servers.rm({ n: 'project' })
  t.truthy(!fs.existsSync(app))
  t.truthy(!fs.existsSync(project))
})

