/* global describe, before, afterEach, it */
process.env.HOME = '/home'
process.env.USERPROFILE = process.env.HOME
process.cwd = () => '/some/dir/project'

const fs = require('fs')
const path = require('path')
const assert = require('assert')
const mock = require('mock-fs')
const servers = require('../../src/cli/servers')
const { serversDir } = require('../../src/common')

describe('add|rm', () => {

  before(() => mock({
    [serversDir]: {}
  }))

  afterEach(() => mock.restore())

  it('should create file', () => {
    servers.add('node index.js')
    const file = path.join(serversDir, 'project.json')
    const conf = {
      cmd: 'node index.js',
      cwd: '/some/dir/project',
      env: {
        PATH: process.env.PATH
      }
    }

    assert.deepEqual(
      JSON.parse(fs.readFileSync(file)),
      conf
    )
  })

  it('should support options', () => {
    process.env.FOO = 'FOO'
    const opts = {
      n: 'app',
      o: '/some/path/out.log',
      e: 'FOO',
      p: 3000
    }
    servers.add('node index.js', opts)

    const file = path.join(serversDir, 'app.json')
    const conf = {
      cmd: 'node index.js',
      cwd: '/some/dir/project',
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
    const project = path.join(serversDir, 'project.json')
    const app = path.join(serversDir, 'app.json')
    servers.rm()
    servers.rm('app')
    assert(!fs.existsSync(project))
    assert(!fs.existsSync(app))
  })
})
