'use strict'

const wiby = require('../..')

exports.desc = 'Use this command to fetch the results of your latest test against a dependent. wiby will go off to the dependent’s repo and fetch the results of the CI run against the patch branch wiby had created.'

exports.builder = (yargs) => yargs
  .option('dependent', {
    desc: 'URL of a dependent',
    demandOption: true,
    type: 'string'
  })

exports.handler = (params) => wiby.result(params.dependent)
