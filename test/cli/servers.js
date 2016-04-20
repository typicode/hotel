/* global describe, before, afterEach, it */
const fs = require('fs')
const path = require('path')
const assert = require('assert')
const mock = require('mock-fs')
const servers = require('../../src/cli/servers')
const { serversDir } = require('../../src/common')

describe('add|rm', () => {

  before(() => {
    process.chdir(path.join(__dirname, '../fixtures/app'))
    mock({
      [serversDir]: {}
    })
  })

  afterEach(() => mock.restore())

  it('should create file', () => {
    servers.add('node index.js')

    const file = path.join(serversDir, 'app.json')
    const conf = {
      cmd: 'node index.js',
      cwd: process.cwd(),
      env: {
        PATH: process.env.PATH
      }
    }

    assert.deepEqual(
      JSON.parse(fs.readFileSync(file)),
      conf
    )
  })

  it('should create file with URL safe characters by defaults', () => {
    servers.add('node index.js', {
      d: '/_-Some Project_Name--'
    })

    const file = path.join(serversDir, 'some-project-name.json')

    assert(fs.existsSync(file))
  })

  it('should be possible to force a name', () => {
    servers.add('node index.js', {
      n: 'Some Project_Name',
      d: '/Some Project_Name'
    })

    const file = path.join(serversDir, 'Some Project_Name.json')

    assert(fs.existsSync(file))
  })

  it('should support options', () => {
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

    assert.deepEqual(
      JSON.parse(fs.readFileSync(file)),
      conf
    )
  })

  it('should remove file', () => {
    const app = path.join(serversDir, 'app.json')
    const project = path.join(serversDir, 'project.json')
    servers.rm()
    servers.rm('project')
    assert(!fs.existsSync(project))
    assert(!fs.existsSync(app))
  })
})
