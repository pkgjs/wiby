'use strict'

const wiby = require('../..')

exports.desc = 'Use this command to close the PRs raised against your dependents. wiby will go off to the dependent’s repo and close the PRs raised that trigger jobs  `package.json` pointing to your latest version (with the new changes) triggering the dependent’s CI to run.'

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
  .option('config', {
    desc: 'Path to the configuration file. By default it will try to load the configuration from the first file it finds in the current working directory: `.wiby.json`, `.wiby.js`',
    type: 'string'
  })

exports.handler = (params) => {
  const config = params.dependent
    ? {
        dependents: [{ repository: params.dependent, pullRequest: !!params['pull-request'] }]
      }
    : wiby.validate({ config: params.config })

  return wiby.closePR(config)
}
