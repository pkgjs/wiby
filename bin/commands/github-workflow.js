'use strict'

exports.desc = 'wiby Github Workflow maintenance tools'

exports.builder = (yargs) => yargs
  .commandDir('./github-workflow')
  .demandCommand()
  .help()
