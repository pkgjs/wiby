'use strict'

const simpleGit = require('simple-git')
const fsPromises = require('fs').promises

exports.getParentBranchName = async function getParentBranchName () {
  const { current } = await simpleGit().branch()

  return current
}

exports.getTestingBranchName = function getTestingBranchName (parentBranchName) {
  return parentBranchName.startsWith('wiby-') ? parentBranchName : `wiby-${parentBranchName}`
}

exports.getDependencyLink = async function getDependencyLink (owner, repo, commitish) {
  return `${owner}/${repo}#${commitish}`
}

exports.getLocalPackageJSON = async function getLocalPackageJSON () {
  const pkg = await fsPromises.readFile('package.json')
  return JSON.parse(pkg)
}

/*
The check should search both the dev and peer dependencies to find out if the dependency is
regular, dev or peer.
 */
exports.checkDependentUsesParent = function checkDependentUsesParent (dep, packageJSON) {
  const dependencyKeyNames = [
    'dependencies',
    'devDependencies',
    'peerDependencies',
    'optionalDependencies'
  ]
  const checkKeyHasDep = (key) => Object.prototype.hasOwnProperty.call(packageJSON, key) && Object.prototype.hasOwnProperty.call(packageJSON[key], dep)
  return dependencyKeyNames.find(x => checkKeyHasDep(x))
}
