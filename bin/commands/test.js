'use strict'

const wiby = require('../..')

exports.desc = 'Use this command to test your breaking changes against any one of your dependents. wiby will go off to the dependent’s repo and create a branch with a patch to the  `package.json` pointing to your latest version (with the new changes) triggering the dependents CI to run.'

exports.builder = (yargs) => yargs
  .option('dependent', {
    desc: 'URL of a dependent',
    demandOption: true,
    type: 'string'
  })

exports.handler = (params) => wiby.test(params.dependent)
