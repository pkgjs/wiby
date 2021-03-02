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
regular, dev or peer. We only want to check on this the once :)
 */
exports.checkPackageInPackageJSON = function checkPackageInPackageJSON (dep, packageJSON) {
  return (
    (Object.prototype.hasOwnProperty.call(packageJSON, 'dependencies') && Object.prototype.hasOwnProperty.call(packageJSON.dependencies, dep)
      ? 'dependencies'
      : false) ||
    (Object.prototype.hasOwnProperty.call(packageJSON, 'devDependencies') && Object.prototype.hasOwnProperty.call(packageJSON.devDependencies, dep)
      ? 'devDependencies'
      : false) ||
    (Object.prototype.hasOwnProperty.call(packageJSON, 'peerDependencies') && Object.prototype.hasOwnProperty.call(packageJSON.peerDependencies, dep)
      ? 'peerDependencies'
      : false)
  )
}
