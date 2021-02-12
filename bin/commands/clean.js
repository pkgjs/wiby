'use strict'

const wiby = require('../..')

exports.desc = 'Use this command to clean up branches created by wiby (i.e. branches with the "wiby-" prefix).'

exports.builder = (yargs) => yargs
  .option('dependent', {
    desc: 'URL of a dependent',
    type: 'string',
    conflicts: 'config'
  })
  .option('config', {
    desc: 'Path to the configuration file. By default it will try to load the configuration from the first file it finds in the current working directory: `.wiby.json`, `.wiby.js`',
    type: 'string'
  })
  .option('all', {
    desc: 'Remove all branches with "wiby-" prefix. By default, `wiby clean` will only remove the branch that would be created if `wiby test` ran in the current repository, on the current branch.'
  })
  .option('dry-run', {
    desc: 'Print the list of branches to be removed.'
  })

exports.handler = async (params) => {
  const config = params.dependent
    ? { dependents: [{ repository: params.dependent }] }
    : wiby.validate({ config: params.config })

  return wiby.clean(config, params)
}
