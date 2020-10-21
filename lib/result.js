const test = require('./test')
const github = require('./github')
const gitURLParse = require('git-url-parse')

module.exports = async function ({ dependents }) {
  const parentPkgJSON = await test.getLocalPackageJSON()
  const parentPkgInfo = gitURLParse(parentPkgJSON.repository.url)
  console.log(`Parent module: ${parentPkgInfo.owner}/${parentPkgJSON.name}`)

  for (const { repository: url } of dependents) {
    const dependentPkgInfo = gitURLParse(url)
    const dependentPkgJSON = await github.getPackageJson(dependentPkgInfo.owner, dependentPkgInfo.name)
    console.log(`Dependent module: ${dependentPkgInfo.owner}/${dependentPkgInfo.name}`)

    if (!test.checkPackageInPackageJSON(parentPkgJSON.name, dependentPkgJSON)) {
      throw new Error(`${parentPkgInfo.owner}/${parentPkgJSON.name} not found in the package.json of ${dependentPkgInfo.owner}/${dependentPkgInfo.name}`)
    }

    const branch = await getBranchName(parentPkgJSON.name)
    let resp = await github.getChecks(dependentPkgInfo.owner, dependentPkgInfo.name, branch)
    if (resp.data.check_runs.length === 0) {
      resp = await github.getCommitStatusesForRef(dependentPkgInfo.owner, dependentPkgInfo.name, branch)
    }

    const runs = resp.data.check_runs || resp.data
    console.log(`Tests on branch "${branch}"`)
    const results = getResultForEachRun(runs)
    console.log(results)
  }
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
