'use strict'

const wiby = require('../..')

exports.desc = 'Check the structure of the configuration file.'

exports.builder = (yargs) => yargs
  .option('config', {
    desc: 'Path to the configuration file. By default it will try to load the configuration from the first file it finds in the current working directory: `.wiby.json`, `.wiby.js`',
    type: 'string'
  })

exports.handler = (params) => wiby.validate(params)
