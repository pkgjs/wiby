'use strict'

const github = require('./github')
const gitURLParse = require('git-url-parse')
const logger = require('./logger')

// setup logger namespace
const testCommandNamespace = 'wiby:clean'
const debug = logger(testCommandNamespace)

module.exports = async ({ dependents }, { all, dryRun }) => {
  // enable log output for test command without DEBUG env
  logger.enableLogs(testCommandNamespace)

  const parentPkgJSON = await require('./test').getLocalPackageJSON()
  const parentPkgInfo = gitURLParse(parentPkgJSON.repository.url)
  debug(`Parent module: ${parentPkgInfo.owner}/${parentPkgJSON.name}`)

  console.log('Branches deleted:')

  for (const { repository: url } of dependents) {
    const dependentPkgInfo = gitURLParse(url)

    let branches

    const branch = await require('./result').getBranchName(parentPkgJSON.name)

    if (all) {
      branches = await github.getWibyBranches(dependentPkgInfo.owner, dependentPkgInfo.name)
    } else if (await github.getBranch(dependentPkgInfo.owner, dependentPkgInfo.name, branch)) {
      branches = [branch]
    } else {
      branches = []
    }

    for (const branch of branches) {
      await github.deleteBranch(dependentPkgInfo.owner, dependentPkgInfo.name, branch)
    }

    console.log(`- ${dependentPkgInfo}: ${branches.length ? branches.join(', ') : '(none)'}`)
  }
}
