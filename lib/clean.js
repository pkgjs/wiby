'use strict'

const context = require('./context')
const github = require('./github')
const gitURLParse = require('git-url-parse')
const logger = require('./logger')
const { ensureGithubToken } = require('./utils')

// setup logger namespace
const cleanCommandNamespace = 'wiby:clean'
const debug = logger(cleanCommandNamespace)

module.exports = async ({ dependents }, { all, dryRun }) => {
  // enable log output for clean command without DEBUG env
  logger.enableLogs(cleanCommandNamespace)

  ensureGithubToken()

  const parentPkgJSON = await context.getLocalPackageJSON()
  const parentPkgInfo = gitURLParse(parentPkgJSON.repository.url)
  debug(`Parent module: ${parentPkgInfo.owner}/${parentPkgJSON.name}`)

  console.log(dryRun ? 'Branches to be deleted:' : 'Branches deleted:')

  for (const { repository: url } of dependents) {
    const dependentPkgInfo = gitURLParse(url)

    let branches

    const parentBranchName = await context.getParentBranchName()
    const branch = await context.getTestingBranchName(parentBranchName)

    if (all) {
      branches = await github.getWibyBranches(dependentPkgInfo.owner, dependentPkgInfo.name)
    } else if (await github.getBranch(dependentPkgInfo.owner, dependentPkgInfo.name, branch)) {
      branches = [branch]
    } else {
      branches = []
    }

    if (!dryRun) {
      for (const branch of branches) {
        await github.deleteBranch(dependentPkgInfo.owner, dependentPkgInfo.name, branch)
      }
    }

    console.log(`- ${dependentPkgInfo}: ${branches.length ? branches.join(', ') : '(none)'}`)
  }
}
