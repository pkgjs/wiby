'use strict'

const wiby = require('../..')

exports.desc = 'Use this command to test your breaking changes against any one of your dependents. wiby will go off to the dependent’s repo and create a branch with a patch to the  `package.json` pointing to your latest version (with the new changes) triggering the dependent’s CI to run.'

exports.builder = (yargs) => yargs
  .option('dependent', {
    desc: 'URL of a dependent',
    type: 'string',
    conflicts: 'config'
  })
  .option('pull-request', {
    desc: 'Raise a draft PR in addition to creating a branch',
    alias: 'pr',
    type: 'boolean',
    conflicts: 'config'
  })
  .option('sha', {
    desc: 'Test against a specific commit or branch',
    type: 'string'
  })
  .option('config', {
    desc: 'Path to the configuration file. By default it will try to load the configuration from the first file it finds in the current working directory: `.wiby.json`, `.wiby.js`',
    type: 'string'
  })

exports.handler = (params) => {
  const config = params.dependent
    ? {
        dependents: [{ repository: params.dependent, pullRequest: !!params['pull-request'], sha: params.sha || 'HEAD' }]
      }
    : wiby.validate({ config: params.config })

  return wiby.test(config)
}
