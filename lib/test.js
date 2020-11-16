const fsPromises = require('fs').promises
const github = require('./github')
const gitURLParse = require('git-url-parse')

module.exports = async function ({ dependents }) {
  const parentPkgJSON = await getLocalPackageJSON()
  const parentPkgInfo = gitURLParse(parentPkgJSON.repository.url)
  console.log(`Parent module: ${parentPkgInfo.owner}/${parentPkgJSON.name}`)

  const commitURL = await getCommitURL(parentPkgInfo.owner, parentPkgInfo.name)
  console.log('Commit URL to test:', commitURL)

  for (const { repository: url } of dependents) {
    const dependentPkgInfo = gitURLParse(url)
    const dependentPkgJSON = await github.getPackageJson(dependentPkgInfo.owner, dependentPkgInfo.name)
    console.log(`Dependent module: ${dependentPkgInfo.owner}/${dependentPkgInfo.name}`)

    if (!checkPackageInPackageJSON(parentPkgJSON.name, dependentPkgJSON)) {
      throw new Error(`${parentPkgInfo.owner}/${parentPkgJSON.name} not found in the package.json of ${dependentPkgInfo.owner}/${dependentPkgInfo.name}`)
    }

    const patchedPackageJSON = applyPatch(commitURL, parentPkgInfo.name, dependentPkgJSON)
    await pushPatch(patchedPackageJSON, dependentPkgInfo.owner, dependentPkgInfo.name, parentPkgJSON.name)
  }
}

const getCommitHash = module.exports.getCommitHash = async function getCommitHash (owner, repo) {
  const [headSha] = await github.getShas(owner, repo)
  return headSha
}

const checkPackageInPackageJSON = module.exports.checkPackageInPackageJSON = function checkPackageInPackageJSON (dep, packageJSON) {
  return Object.prototype.hasOwnProperty.call(packageJSON.dependencies, dep)
}

const getCommitURL = module.exports.getCommitURL =
async function getCommitURL (owner, repo, hash) {
  hash = hash || await getCommitHash(owner, repo)

  const patch = `${owner}/${repo}#${hash}`
  return patch
}

const getLocalPackageJSON = module.exports.getLocalPackageJSON =
async function getLocalPackageJSON (pkgPath) {
  pkgPath = pkgPath || 'package.json'
  const pkg = await fsPromises.readFile(pkgPath)
  return JSON.parse(pkg)
}

const applyPatch = module.exports.applyPatch =
function applyPatch (patch, module, packageJSON) {
  if (!Object.prototype.hasOwnProperty.call(packageJSON.dependencies, module)) {
    throw new Error('Dependency not found in package.json')
  }
  packageJSON.dependencies[module] = patch
  return packageJSON
}

async function pushPatch (packageJSON, owner, repo, dep) {
  const file = JSON.stringify(packageJSON, null, 2) + '\n' // assumes package.json is using two spaces
  const encodedFile = Buffer.from(file).toString('base64')
  const message = `wiby: update ${dep}`
  const branch = await require('./result').getBranchName(dep)

  const [headSha, treeSha] = await github.getShas(owner, repo)
  const blobSha = await github.createBlob(owner, repo, encodedFile)
  const newTreeSha = await github.createTree(owner, repo, treeSha, blobSha)
  const commitSha = await github.createCommit(owner, repo, message, newTreeSha, headSha)
  await github.createBranch(owner, repo, commitSha, branch)
  console.log(`Changes pushed to https://github.com/${owner}/${repo}/blob/${branch}/package.json`)
}
