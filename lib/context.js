'use strict'

const fsPromises = require('fs').promises

exports.getTestingBranchName = async function getTestingBranchName (parentPackageName) {
  return `wiby-${parentPackageName}`
}

exports.getLocalPackageJSON = async function getLocalPackageJSON () {
  const pkg = await fsPromises.readFile('package.json')
  return JSON.parse(pkg)
}

/*
The check should search both the dev and peer dependencies to find out if the dependency is
regular, dev or peer.
 */
exports.checkPackageInPackageJSON = function checkPackageInPackageJSON (dep, packageJSON) {
  const dependencyKeyNames = [
    'dependencies',
    'devDependencies',
    'peerDependencies',
    'optionalDependencies'
  ]
  const checkKeyHasDep = (key) => Object.prototype.hasOwnProperty.call(packageJSON, key) && Object.prototype.hasOwnProperty.call(packageJSON[key], dep)
  return dependencyKeyNames.find(x => checkKeyHasDep(x))
}
