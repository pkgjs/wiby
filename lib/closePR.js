'use strict'

const github = require('../lib/github')
const logger = require('./logger')
const context = require('./context')
const gitURLParse = require('git-url-parse')
const { ensureGithubToken } = require('./utils')

const debug = logger('wiby:closepr')

module.exports = async ({ dependents }) => {
  ensureGithubToken()

  const closedPrs = []
  for (const { repository: url, pullRequest } of dependents) {
    if (pullRequest) {
      const dependentPkgInfo = gitURLParse(url)
      const parentBranchName = await context.getParentBranchName()
      const branch = await context.getTestingBranchName(parentBranchName)
      const resp = await github.getChecks(dependentPkgInfo.owner, dependentPkgInfo.name, branch)
      const closedPR = await closeDependencyPR(dependentPkgInfo.owner, dependentPkgInfo.name, branch, resp.data.check_runs)
      if (closedPR) {
        closedPrs.push(closedPR)
      }
    }
  }
  return closedPrs
}

const closeDependencyPR = module.exports.closeDependencyPR = async function closeDependencyPR (owner, repo, branch, checkRuns) {
  if (!checkRuns) {
    return
  }
  // TODO, in reality multiple checks could exist and they may not all have passed
  const prsToClose = checkRuns.reduce((acc, check) => {
    if (check.status === 'completed' &&
      check.conclusion === 'success' &&
      check.pull_requests &&
      check.pull_requests.length !== 0) {
      check.pull_requests.forEach((pr) => {
        if (pr.head.ref === branch) {
          acc.push({
            number: pr.number
          })
        }
      })
    }
    return acc
  }, [])
  debug(`Dependent module: ${JSON.stringify(prsToClose, null, 2)}`)
  return await Promise.all(prsToClose.map((pr) => github.closePR(owner, repo, pr.number)))
}
