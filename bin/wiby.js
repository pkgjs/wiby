#!/usr/bin/env node

require('dotenv').config()
const test = require('../lib/test')
const result = require('../lib/result')
const yargs = require('yargs')

yargs
  .command(
    'test',
    'Use this command to test your breaking changes against any one of your dependents. Wiby will go off to the dependent\'s repo and create a branch with a patch to the' +
    ' `package.json` pointing to your latest version (with the new changes) triggering the dependents CI to run.',
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
    'Use this command to fetch the results of your latest test against a dependent. Wiby will go off to the dependent\'s repo and fetch the results of the CI run against the patch branch Wiby had created',
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
  .demandCommand()
  .help()
  .strict()
  .parse()

// Usage: wiby test --dependent=URL
// Usage: wiby result --dependent=URL
