const yargs = require('yargs')
const servers = require('./servers')
const run = require('./run')
const daemon = require('./daemon')
const pkg = require('../../package.json')

const addOptions = {
  name: {
    alias: 'n',
    describe: 'Server name'
  },
  port: {
    alias: 'p',
    describe: 'Set PORT environment variable',
    number: true
  },
  out: {
    alias: 'o',
    describe: 'Output file'
  },
  env: {
    alias: 'e',
    describe: 'Additional environment variables',
    array: true
  },
  xfwd: {
    alias: 'x',
    describe: 'Adds x-forward headers',
    default: false,
    boolean: true
  },
  'change-origin': {
    alias: 'co',
    describe: 'Changes the origin of the host header to the target URL',
    default: false,
    boolean: true
  },
  'http-proxy-env': {
    describe: 'Adds HTTP_PROXY environment variable',
    default: false,
    boolean: true
  },
  dir: {
    describe: 'Server directory',
    string: true
  }
}

module.exports = processArgv =>
  yargs(processArgv.slice(2))
    .version(pkg.version)
    .alias('v', 'version')
    .help('h')
    .alias('h', 'help')
    .command(
      'add <cmd_or_url> [options]',
      'Add server or proxy',
      yargs => yargs.options(addOptions),
      // .demand(1),
      argv => servers.add(argv['cmd_or_url'], argv)
    )
    .command(
      'run <cmd> [options]',
      'Run server and get a temporary local domain',
      yargs => {
        const runOptions = { ...addOptions }
        delete runOptions['out']
        return yargs.options(runOptions)
        // TODO demand(1) ?
      },
      argv => run.spawn(argv['cmd'], argv)
    )
    .command(
      'rm [options]',
      'Remove server or proxy',
      yargs => {
        yargs.option('name', {
          alias: 'n',
          describe: 'Name'
        })
      },
      argv => servers.rm(argv)
    )
    .command('ls', 'List servers', {}, argv => servers.ls(argv))
    .command('start', 'Start daemon', {}, () => daemon.start())
    .command('stop', 'Stop daemon', {}, () => daemon.stop())
    .example('$0 add --help')
    .example('$0 add nodemon')
    .example('$0 add npm start')
    .example("$0 add 'cmd -p $PORT'")
    .example("$0 add 'cmd -p $PORT' --port 4000")
    .example("$0 add 'cmd -p $PORT' --out app.log")
    .example("$0 add 'cmd -p $PORT' --name app")
    .example("$0 add 'cmd -p $PORT' --env PATH")
    .example('$0 add http://192.168.1.10 -n app ')
    .example('$0 rm')
    .example('$0 rm -n app')
    .epilog('https://github.com/typicode/hotel')
    .demand(1)
    .strict()
    .help().argv
