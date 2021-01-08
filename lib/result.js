const test = require('./test')
const github = require('./github')
const gitURLParse = require('git-url-parse')
const debug = require('./logger')('wiby:result')

module.exports = async function ({ dependents }) {
  const parentPkgJSON = await test.getLocalPackageJSON()
  const parentPkgInfo = gitURLParse(parentPkgJSON.repository.url)
  const output = { status: 'pending', results: [] }
  const allDependantsChecks = []

  debug(`Parent module: ${parentPkgInfo.owner}/${parentPkgJSON.name}`)

  for (const { repository: url } of dependents) {
    const dependentPkgInfo = gitURLParse(url)
    const dependentPkgJSON = await github.getPackageJson(dependentPkgInfo.owner, dependentPkgInfo.name)
    debug(`Dependent module: ${dependentPkgInfo.owner}/${dependentPkgInfo.name}`)

    if (!test.checkPackageInPackageJSON(parentPkgJSON.name, dependentPkgJSON)) {
      throw new Error(`${parentPkgInfo.owner}/${parentPkgJSON.name} not found in the package.json of ${dependentPkgInfo.owner}/${dependentPkgInfo.name}`)
    }

    const branch = await getBranchName(parentPkgJSON.name)
    let resp = await github.getChecks(dependentPkgInfo.owner, dependentPkgInfo.name, branch)
    if (resp.data.check_runs.length === 0) {
      resp = await github.getCommitStatusesForRef(dependentPkgInfo.owner, dependentPkgInfo.name, branch)
    }

    const runs = resp.data.check_runs || resp.data
    debug(`Tests on branch "${branch}"`)
    const results = getResultForEachRun(runs)

    // add current dependent check to general list for calculating overall status
    results.forEach(runResult => (allDependantsChecks.push(runResult)))

    // form a result object with dependents statuses
    output.results.push({
      dependent: `${dependentPkgInfo.owner}/${dependentPkgInfo.name}`,
      status: getOverallStatusForAllRuns(results),
      runs: results
    })

    debug(results)
  }

  output.status = getOverallStatusForAllRuns(allDependantsChecks)

  return output
}

const getBranchName = module.exports.getBranchName = async function getBranchName (dep) {
  return `wiby-${dep}`
}

const getResultForEachRun = module.exports.getResultForEachRun = function getResultForEachRun (runs) {
  return runs.map((check) => {
    if (check.status === 'queued') {
      return [check.name, check.status]
    }
    return [check.name, check.conclusion]
  })
}

/**
 * Accepts pipeline checks results and resolves overall checks status for passed array of runs
 * Retunts 'failure', 'pending' or 'success'
 */
const getOverallStatusForAllRuns = module.exports.getOverallStatusForAllRuns = function getOverallStatusForAllRuns (runs) {
  const statuses = []
  let isAllSuccess = true

  runs.forEach(runResult => {
    // run get status
    const status = runResult[1]

    if (status !== 'success') {
      isAllSuccess = false
    }

    statuses.push(status)
  })

  // if includes at least 1 failure - overall status is failure
  if (statuses.includes('failure')) {
    return 'failure'
  }

  // if includes null or pending - overall status us pending
  if (statuses.includes(null) || statuses.includes('pending')) {
    return 'pending'
  }

  // return success only in case all result = 'success'
  // return failure in case unexpected status detected
  return isAllSuccess ? 'success' : 'failure'
}
