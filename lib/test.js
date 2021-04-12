'use strict'

const context = require('./context')
const github = require('./github')
const gitURLParse = require('git-url-parse')
const logger = require('./logger')

// setup logger namespace
const testCommandNamespace = 'wiby:test'
const debug = logger(testCommandNamespace)

module.exports = async function ({ dependents, pullRequest }) {
  // enable log output for test command without DEBUG env
  logger.enableLogs(testCommandNamespace)

  const parentPkgJSON = await context.getLocalPackageJSON()
  const parentRepositoryInfo = gitURLParse(parentPkgJSON.repository.url)
  const parentBranchName = await context.getParentBranchName()
  debug(`Parent module: ${parentRepositoryInfo.owner}/${parentPkgJSON.name}`)

  const parentDependencyLink = await context.getDependencyLink(parentRepositoryInfo.owner, parentRepositoryInfo.name, parentBranchName)
  debug('Commit URL to test:', parentDependencyLink)

  for (const { repository: url } of dependents) {
    const dependentRepositoryInfo = gitURLParse(url)
    const dependentPkgJson = await github.getPackageJson(dependentRepositoryInfo.owner, dependentRepositoryInfo.name)
    debug(`Dependent module: ${dependentRepositoryInfo.owner}/${dependentRepositoryInfo.name}`)

    if (!context.checkDependentUsesParent(parentPkgJSON.name, dependentPkgJson)) {
      throw new Error(`${parentRepositoryInfo.owner}/${parentPkgJSON.name} not found in the package.json of ${dependentRepositoryInfo.owner}/${dependentRepositoryInfo.name}`)
    }

    const patchedPackageJSON = applyPatch(parentDependencyLink, parentPkgJSON.name, dependentPkgJson, parentPkgJSON.name)
    await pushPatch(patchedPackageJSON, dependentRepositoryInfo.owner, dependentRepositoryInfo.name, parentPkgJSON.name, parentBranchName)
    if (pullRequest) {
      await createPR(dependentRepositoryInfo.owner, dependentRepositoryInfo.name, parentBranchName, parentDependencyLink)
    }
  }
}

const applyPatch = module.exports.applyPatch =
function applyPatch (patch, module, dependentPkgJSON) {
  const dependencyType = context.checkDependentUsesParent(module, dependentPkgJSON)
  if (!dependencyType) {
    throw new Error('Dependency not found in package.json')
  }
  dependentPkgJSON[dependencyType][module] = patch
  return dependentPkgJSON
}

async function pushPatch (dependentPkgJson, dependentOwner, dependentRepo, parentName, parentBranchName) {
  const file = JSON.stringify(dependentPkgJson, null, 2) + '\n' // assumes package.json is using two spaces
  const encodedFile = Buffer.from(file).toString('base64')
  const message = `wiby: update ${parentName}`
  const branch = await context.getTestingBranchName(parentBranchName)

  const [headSha, treeSha] = await github.getShas(dependentOwner, dependentRepo)
  const blobSha = await github.createBlob(dependentOwner, dependentRepo, encodedFile)
  const newTreeSha = await github.createTree(dependentOwner, dependentRepo, treeSha, blobSha)
  const commitSha = await github.createCommit(dependentOwner, dependentRepo, message, newTreeSha, headSha)
  await github.createBranch(dependentOwner, dependentRepo, commitSha, branch)
  debug(`Changes pushed to https://github.com/${dependentOwner}/${dependentRepo}/blob/${branch}/package.json`)
}

const createPR = module.exports.closePR = async function closePR (dependentOwner, dependentRepo, parentBranchName, parentDependencyLink) {
  const title = `Wiby changes to ${parentDependencyLink}`
  const body = `Wiby has raised this PR to kick off automated jobs.
  You are dependent upon ${parentDependencyLink}
  `
  const head = context.getTestingBranchName(parentBranchName)
  const draft = true
  const result = await github.createPR(dependentOwner, dependentRepo, title, head, parentBranchName, draft, body)
  debug(`PR raised upon ${result.data.html_url}`)
  return result
}
