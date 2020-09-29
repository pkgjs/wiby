'use strict'

const path = require('path')

exports.validate = ({ config }) => {
  const contents = require(path.join(process.cwd(), '.wiby.json'))
  console.log(contents)
}
