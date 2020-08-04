#!/usr/bin/env node

require('dotenv').config()
const test = require('../lib/test')
const result = require('../lib/result')
const yargs = require('yargs')

yargs
  .command(
    'test',
    'Test your dependents',
    (yargs) => {
      yargs
        .option('dependent', {
          desc: 'URL of a dependent',
          demandOption: true,
          type: 'string'
        })
    },
    (argv) => {
      test(argv.dependent)
    }
  )
  .command(
    'result',
    'Fetch the results of your tests',
    (yargs) => {
      yargs
        .option('dependent', {
          desc: 'URL of a dependent',
          demandOption: true,
          type: 'string'
        })
    },
    (argv) => {
      result(argv.dependent).catch(e => {
        console.error(e)
        process.exitCode = e.code || 1
      })
    }
  )
  .help()
  .strict()
  .parse()

// Usage: wiby test --dependent=URL
// Usage: wiby result --dependent=URL
