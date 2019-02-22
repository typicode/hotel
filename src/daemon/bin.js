#!/usr/bin/env node

const yargs = require('yargs')
const common = require('../common')

/* eslint-disable no-unused-expressions */
yargs(process.argv.slice(2))
  .help('h')
  .alias('h', 'help')
  .command(
    'start [options]',
    'Start daemon',
    yargs => {
      yargs.option('hotel-dir', {
        description: 'Hotel directory',
        default: common.hotelDir
      })
    },
    opts => {
      common.hotelDir = opts.hotelDir
      require('./')
    }
  )
  .example('$0 start')
  .example('$0 start --hotel-dir /var/hotel')
  .demand(1)
  .strict()
  .help().argv
