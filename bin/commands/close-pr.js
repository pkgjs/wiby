'use strict'

const wiby = require('../..')

exports.desc = 'Use this command to close the PRs raised against your dependents. wiby will go off to the dependent’s repo and close the PRs raised that trigger jobs  `package.json` pointing to your latest version (with the new changes) triggering the dependent’s CI to run.'

exports.builder = (yargs) => yargs
  .option('dependent', {
    desc: 'URL of a dependent',
    type: 'string',
    conflicts: 'config'
  })
  .option('close-pr', {
    desc: 'Close a PR of a dependent raised in test',
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
        dependents: [{ repository: params.dependent, pullRequest: true }]
      }
    : wiby.validate({ config: params.config })

  const result = await wiby.closePR(config)
  const output = `${result.length} PRs closed`
  console.log(output)
  return output
}
