'use strict'

const wiby = require('../..')

exports.desc = 'Use this command to fetch the results of your latest test against a dependent. wiby will go off to the dependent’s repo and fetch the results of the CI run against the patch branch wiby had created.'

exports.builder = (yargs) => yargs
  .option('dependent', {
    desc: 'URL of a dependent',
    type: 'string',
    conflicts: 'config'
  })
  .option('pull-request', {
    desc: 'close a draft PR created in the test phase',
    alias: 'pr',
    type: 'boolean',
    conflicts: 'config'
  })
  .option('config', {
    desc: 'Path to the configuration file. By default it will try to load the configuration from the first file it finds in the current working directory: `.wiby.json`, `.wiby.js`',
    type: 'string'
  })

exports.handler = async (params) => {
  const config = params.dependent
    ? {
        dependents: [{ repository: params.dependent }],
        pullRequest: !!params['pull-request']
      }
    : wiby.validate({ config: params.config })

  const result = await wiby.result(config)

  return wiby.result.processOutput(result)
}
