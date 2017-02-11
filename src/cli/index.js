const yargs = require('yargs')
const servers = require('./servers')
const daemon = require('./daemon')
const pkg = require('../../package.json')

module.exports = (processArgv) => {
  yargs(processArgv.slice(2))
    .version(pkg.version).alias('v', 'version')
    .help('h').alias('h', 'help')
    .command(
      'add <cmd_or_url> [options]',
      'Add server or proxy',
      (yargs) => yargs
        .option('name', {
          alias: 'n',
          describe: 'Server name'
        })
        .option('port', {
          alias: 'p',
          describe: 'Set PORT environment variable',
          number: true
        })
        .option('out', {
          alias: 'o',
          describe: 'Output file'
        })
        .option('env', {
          alias: 'e',
          describe: 'Additional environment variables',
          array: true
        })
        .option('xfwd', {
          alias: 'x',
          describe: 'Adds x-forward headers',
          default: false,
          boolean: true
        })
        .option('change-origin', {
          alias: 'co',
          describe: 'Changes the origin of the host header to the target URL',
          default: false,
          boolean: true
        })
        .demand(1),
      (argv) => servers.add(argv['cmd_or_url'], argv)
    )
    .command(
      'run <cmd> [options]',
      'Run server and get a temporary local domain',
      (yargs) => yargs
        .option('name', {
          alias: 'n',
          describe: 'Server name'
        })
        .option('port', {
          alias: 'p',
          describe: 'Set PORT environment variable',
          number: true
        })
        .option('env', {
          alias: 'e',
          describe: 'Additional environment variables',
          array: true
        })
        .option('xfwd', {
          alias: 'x',
          describe: 'Adds x-forward headers',
          default: false,
          boolean: true
        })
        .option('change-origin', {
          alias: 'co',
          describe: 'Changes the origin of the host header to the target URL',
          default: false,
          boolean: true
        })
        .demand(1),
      (argv) => servers.run(argv['cmd'], argv)
    )
    .command(
      'rm [options]',
      'Remove server or proxy',
      (yargs) => {
        yargs
          .option('name', {
            alias: 'n',
            describe: 'Name'
          })
      },
      (argv) => servers.rm(argv)
    )
    .command(
      'ls',
      'List servers',
      {},
      (argv) => servers.ls(argv)
    )
    .command(
      'start',
      'Start daemon',
      {},
      () => daemon.start()
    )
    .command(
      'stop',
      'Stop daemon',
      {},
      () => daemon.stop()
    )
    .example('$0 add --help')
    .example('$0 add nodemon')
    .example('$0 add npm start')
    .example('$0 add \'cmd -p $PORT\'')
    .example('$0 add \'cmd -p $PORT\' --port 4000')
    .example('$0 add \'cmd -p $PORT\' --output app.log')
    .example('$0 add \'cmd -p $PORT\' --name app')
    .example('$0 add \'cmd -p $PORT\' --env PATH')
    .example('$0 add http://192.168.1.10 -n app ')
    .epilog('https://github.com/typicode/hotel')
    .demand(1)
    .strict()
    .help()
    .argv
}
