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
        .option('out', {
          alias: 'o',
          describe: 'Output file'
        })
        .option('env', {
          alias: 'e',
          array: true,
          describe: 'Additional environment variables'
        })
        .option('port', {
          alias: 'p',
          describe: 'Set PORT environment variable'
        })
        .demand(1),
      (argv) => servers.add(argv['cmd_or_url'], argv)
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
