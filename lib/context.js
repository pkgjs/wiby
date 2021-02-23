'use strict'

const fsPromises = require('fs').promises

exports.getTestingBranchName = async function getTestingBranchName (parentPackageName) {
  return `wiby-${parentPackageName}`
}

exports.getLocalPackageJSON = async function getLocalPackageJSON () {
  const pkg = await fsPromises.readFile('package.json')
  return JSON.parse(pkg)
}

exports.checkPackageInPackageJSON = function checkPackageInPackageJSON (dep, packageJSON) {
  return Object.prototype.hasOwnProperty.call(packageJSON.dependencies, dep)
}
