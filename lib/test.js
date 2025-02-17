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
  const parentRepositoryInfo = gitURLParse(parentPkgJSON.repository.url)
  const parentBranchName = await context.getParentBranchName()
  debug(`Parent module: ${parentRepositoryInfo.owner}/${parentPkgJSON.name}`)

  const parentDependencyLink = await context.getDependencyLink(parentRepositoryInfo.owner, parentRepositoryInfo.name, parentBranchName)
  debug('Commit URL to test:', parentDependencyLink)

  for (const { repository: url, pullRequest, sha } of dependents) {
    const dependentRepositoryInfo = gitURLParse(url)
    const dependentPkgJson = await github.getPackageJson(dependentRepositoryInfo.owner, dependentRepositoryInfo.name, sha)
    debug(`Dependent module: ${dependentRepositoryInfo.owner}/${dependentRepositoryInfo.name}, sha ${sha}`)

    if (!context.checkDependentUsesParent(parentPkgJSON.name, dependentPkgJson)) {
      throw new Error(`${parentRepositoryInfo.owner}/${parentPkgJSON.name} not found in the package.json of ${dependentRepositoryInfo.owner}/${dependentRepositoryInfo.name}`)
    }

    const patchedPackageJSON = applyPatch(parentDependencyLink, parentPkgJSON.name, dependentPkgJson, parentPkgJSON.name)
    await pushPatch(patchedPackageJSON, dependentRepositoryInfo.owner, dependentRepositoryInfo.name, parentPkgJSON.name, parentBranchName, sha)
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

async function pushPatch (dependentPkgJson, dependentOwner, dependentRepo, parentName, parentBranchName, shaRef) {
  const file = JSON.stringify(dependentPkgJson, null, 2) + '\n' // assumes package.json is using two spaces
  const encodedFile = Buffer.from(file).toString('base64')
  const message = `wiby: update ${parentName}`
  const testingBranchName = await context.getTestingBranchName(parentBranchName)

  const testingBranch = await github.getBranch(dependentOwner, dependentRepo, testingBranchName)
  const blobSha = await github.createBlob(dependentOwner, dependentRepo, encodedFile)

  if (!testingBranch) {
    // testing branch does not yet exist - create it
    const { headSha, treeSha } = await github.getShas(dependentOwner, dependentRepo, shaRef)
    const newTreeSha = await github.createTree(dependentOwner, dependentRepo, treeSha, blobSha)
    const commitSha = await github.createCommit(dependentOwner, dependentRepo, message, newTreeSha, headSha)
    await github.createBranch(dependentOwner, dependentRepo, commitSha, testingBranchName)

    debug(`Changes pushed to https://github.com/${dependentOwner}/${dependentRepo}/blob/${testingBranchName}/package.json`)
  } else {
    // testing branch already exists - ensure we have the package.json patched or at least push an empty commit
    const { sha: headSha, commit: { tree: { sha: treeSha } } } = testingBranch.commit
    const newTreeSha = await github.createTree(dependentOwner, dependentRepo, treeSha, blobSha)
    const commitSha = await github.createCommit(dependentOwner, dependentRepo, message, newTreeSha, headSha)
    await github.updateRef(dependentOwner, dependentRepo, `heads/${testingBranchName}`, commitSha)

    debug(`Pushed a new commit to https://github.com/${dependentOwner}/${dependentRepo}#${testingBranchName}`)
  }
}

async function createPR (dependentOwner, dependentRepo, parentBranchName, parentDependencyLink) {
  const title = `Wiby changes to ${parentDependencyLink}`
  const body = `Wiby has raised this PR to kick off automated jobs.
  You are dependent upon ${parentDependencyLink}
  `
  const testingBranchName = context.getTestingBranchName(parentBranchName)

  const pullsForTestingBranch = await github.getPullsForBranch(dependentOwner, dependentRepo, testingBranchName)
  if (pullsForTestingBranch.length) {
    debug(`Existing PRs updated: ${pullsForTestingBranch.map((data) => data.html_url).join(', ')}`)
    return
  }

  const draft = true
  /*
        from the conversation on wiby PR 93 https://github.com/pkgjs/wiby/pull/93#discussion_r615362448
        it was seen that the raising of a PR from head to main was in general ok but in the case where the
        dependency feature branch does exist in the dependent then maybe detection and handle would offer a
        better experience.
   */
  const preExistingOnDependent = await github.getBranch(dependentOwner, dependentRepo, parentBranchName)
  let result
  if (preExistingOnDependent) {
    result = await github.createPR(dependentOwner, dependentRepo, title, testingBranchName, parentBranchName, draft, body)
    debug(`PR raised upon ${result.data.html_url} (base branch: ${parentBranchName})`)
  } else {
    const defaultBranch = await github.getDefaultBranch(dependentOwner, dependentRepo)
    result = await github.createPR(dependentOwner, dependentRepo, title, testingBranchName, defaultBranch, draft, body)
    debug(`PR raised upon ${result.data.html_url} (base branch: ${defaultBranch})`)
  }
  return result
}
