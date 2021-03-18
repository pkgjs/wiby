'use strict'

const context = require('./context')
const github = require('./github')
const gitURLParse = require('git-url-parse')
const logger = require('./logger')

// setup logger namespace
const testCommandNamespace = 'wiby:test'
const debug = logger(testCommandNamespace)

module.exports = async function ({ dependents }) {
  // enable log output for test command without DEBUG env
  logger.enableLogs(testCommandNamespace)

  const parentPkgJSON = await context.getLocalPackageJSON()
  const parentPkgInfo = gitURLParse(parentPkgJSON.repository.url)
  debug(`Parent module: ${parentPkgInfo.owner}/${parentPkgJSON.name}`)

  const commitURL = await getCommitURL(parentPkgInfo.owner, parentPkgInfo.name)
  debug('Commit URL to test:', commitURL)

  for (const { repository: url } of dependents) {
    const dependentPkgInfo = gitURLParse(url)
    const dependentPkgJSON = await github.getPackageJson(dependentPkgInfo.owner, dependentPkgInfo.name)
    debug(`Dependent module: ${dependentPkgInfo.owner}/${dependentPkgInfo.name}`)

    if (!context.checkPackageInPackageJSON(parentPkgJSON.name, dependentPkgJSON)) {
      throw new Error(`${parentPkgInfo.owner}/${parentPkgJSON.name} not found in the package.json of ${dependentPkgInfo.owner}/${dependentPkgInfo.name}`)
    }

    const patchedPackageJSON = applyPatch(commitURL, parentPkgJSON.name, dependentPkgJSON)
    await pushPatch(patchedPackageJSON, dependentPkgInfo.owner, dependentPkgInfo.name, parentPkgJSON.name)
  }
}

const getCommitHash = async function getCommitHash (owner, repo) {
  const [headSha] = await github.getShas(owner, repo)
  return headSha
}

const getCommitURL = async function getCommitURL (owner, repo, hash) {
  hash = hash || await getCommitHash(owner, repo)

  const patch = `${owner}/${repo}#${hash}`
  return patch
}

const applyPatch = module.exports.applyPatch =
function applyPatch (patch, module, dependentPkgJSON) {
  const dependencyType = context.checkPackageInPackageJSON(module, dependentPkgJSON)
  if (!dependencyType) {
    throw new Error('Dependency not found in package.json')
  }
  dependentPkgJSON[dependencyType][module] = patch
  return dependentPkgJSON
}

async function pushPatch (packageJSON, owner, repo, dep) {
  const file = JSON.stringify(packageJSON, null, 2) + '\n' // assumes package.json is using two spaces
  const encodedFile = Buffer.from(file).toString('base64')
  const message = `wiby: update ${dep}`
  const branch = await context.getTestingBranchName(dep)

  const [headSha, treeSha] = await github.getShas(owner, repo)
  const blobSha = await github.createBlob(owner, repo, encodedFile)
  const newTreeSha = await github.createTree(owner, repo, treeSha, blobSha)
  const commitSha = await github.createCommit(owner, repo, message, newTreeSha, headSha)
  await github.createBranch(owner, repo, commitSha, branch)
  debug(`Changes pushed to https://github.com/${owner}/${repo}/blob/${branch}/package.json`)
}
