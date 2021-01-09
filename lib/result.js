const test = require('./test')
const github = require('./github')
const gitURLParse = require('git-url-parse')
const debug = require('./logger')('wiby:result')

// enum containing possible pipeline checks statuses
const pipelineStatsesEnum = module.exports.pipelineStatsesEnum = Object.freeze({
  FAILED: 'failure',
  QUEUED: 'queued',
  PENDING: 'pending',
  SUCCEED: 'success'
})

const PENDING_RESULT_EXIT_CODE = 64

module.exports = async function ({ dependents }) {
  const parentPkgJSON = await test.getLocalPackageJSON()
  const parentPkgInfo = gitURLParse(parentPkgJSON.repository.url)
  const output = { status: pipelineStatsesEnum.PENDING, results: [] }
  const allDependentsChecks = []

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
    results.forEach(runResult => (allDependentsChecks.push(runResult)))

    // form a result object with dependents statuses
    output.results.push({
      dependent: `${dependentPkgInfo.owner}/${dependentPkgInfo.name}`,
      status: getOverallStatusForAllRuns(results),
      runs: results
    })

    debug(results)
  }

  output.status = getOverallStatusForAllRuns(allDependentsChecks)

  debug(output)

  return output
}

const getBranchName = module.exports.getBranchName = async function getBranchName (dep) {
  return `wiby-${dep}`
}

const getResultForEachRun = module.exports.getResultForEachRun = function getResultForEachRun (runs) {
  return runs.map((check) => {
    if (check.status === pipelineStatsesEnum.QUEUED) {
      return [check.name, check.status]
    }
    return [check.name, check.conclusion]
  })
}

/**
 * Accepts pipeline checks results and resolves overall checks status for passed array of runs
 * Returns 'failure', 'pending' or 'success'
 */
const getOverallStatusForAllRuns = module.exports.getOverallStatusForAllRuns = function getOverallStatusForAllRuns (runs) {
  const statuses = []
  let isAllSuccess = true

  runs.forEach(runResult => {
    // run get status
    const status = runResult[1]

    if (status !== pipelineStatsesEnum.SUCCEED) {
      isAllSuccess = false
    }

    statuses.push(status)
  })

  // if includes at least 1 failure - overall status is failure
  if (statuses.includes(pipelineStatsesEnum.FAILED)) {
    return pipelineStatsesEnum.FAILED
  }

  // if includes null or pending or queued - overall status is pending
  if (statuses.includes(null) ||
    statuses.includes(pipelineStatsesEnum.PENDING) ||
    statuses.includes(pipelineStatsesEnum.QUEUED)
  ) {
    return pipelineStatsesEnum.PENDING
  }

  // return success only in case all result = 'success'
  // return failure in case unexpected status detected
  return isAllSuccess ? pipelineStatsesEnum.SUCCEED : pipelineStatsesEnum.FAILED
}

/**
 * Accepts result object from wiby.result(), outputs markdown
 * and resolves exit code based on overall status
 */
module.exports.processOutput = function processOutput (result) {
  printResultOutputMd(result)
  resolveCodeAndExit(result.status)
}

/**
 * Builds and outputs markdown for wiby.result()
 */
function printResultOutputMd (result) {
  let md = `# wiby result command

Overall status - ${result.status}\n\n`

  result.results.forEach(dependent => {
    md += `## ${dependent.dependent} - ${dependent.status}

Checks:\n\n`

    dependent.runs.forEach((run, index, arr) => {
      md += `- ${run[0]} - ${run[1]}\n`

      // extra line for next dependent
      if (arr.length - 1 === index) {
        md += '\n'
      }
    })
  })

  // output built markdown
  console.log(md)
}

/**
 * Based on overall status from wiby.result() - resolves with what exit code
 * process should be ended
 */
function resolveCodeAndExit (overallStatus) {
  if (overallStatus === pipelineStatsesEnum.FAILED) {
    process.exit(1)
  } else if (overallStatus === pipelineStatsesEnum.PENDING) {
    process.exit(PENDING_RESULT_EXIT_CODE)
  }
}
