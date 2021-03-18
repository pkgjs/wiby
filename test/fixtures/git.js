'use strict'

const path = require('path')

exports.init = function () {
  const cwd = path.join(__dirname, '..', '..')
  process.chdir(cwd)
  return cwd
}
