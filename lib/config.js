'use strict'

const joi = require('joi')
const path = require('path')
const logger = require('./logger')

const debug = logger('wiby:config')

const dependentSchema = joi.object({
  repository: joi.string().uri({
    scheme: [
      'https',
      'git',
      'git+https'
    ]
  }),
  pullRequest: joi.boolean().optional(),
  sha: joi.string().optional().default('HEAD')
}).unknown(false)

exports.schema = joi.object({
  dependents: joi.array().items(dependentSchema)
}).unknown(false)

exports.validate = ({ config: configFilePath }) => {
  if (!configFilePath) {
    configFilePath = path.join(process.cwd(), '.wiby.json')
  }

  configFilePath = path.resolve(configFilePath)

  const contents = require(configFilePath)

  const result = exports.schema.validate(contents)

  if (result.error) {
    throw result.error
  }

  debug(`✅ ${configFilePath}`)

  return result.value
}
