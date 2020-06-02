const fsPromises = require('fs').promises
const fetch = require('node-fetch')
const github = require('./github')

module.exports = async function (url) {
  const dep = await getLocalPackageName()
  console.log('Got local package name: ', dep)
  const [org, repo] = getOrgRepo(url)
  console.log(`Got org: ${org} and repo: ${repo}`)
  const packageJSON = await github.getPackageJson(org, repo)
  if (!checkPackageInPackageJSON(dep, packageJSON)) {
    throw new Error('Dependency not found in package.json')
  }
  const patch = await getPatch(dep)
  console.log('Created patch: ', patch)
  const patchedPackageJSON = applyPatch(patch, dep, packageJSON)
  await pushPatch(patchedPackageJSON, org, repo, dep)
}

const getCommitHash = module.exports.getCommitHash =
async function getCommitHash (owner, repo) {
  const headSha = (await github.getShas(owner, repo))[0]
  return headSha
}

const checkPackageInPackageJSON = module.exports.checkPackageInPackageJSON =
function checkPackageInPackageJSON (dep, packageJSON) {
  return Object.prototype.hasOwnProperty.call(packageJSON.dependencies, dep)
}

const getOrgRepo = module.exports.getOrgRepo =
function getOrgRepo (url) {
  const repoOrgArr = (url.split('github.com'))[1].split('/')
  const org = repoOrgArr[1]
  const repo = repoOrgArr[2]
  return [org, repo]
}

const getPatch = module.exports.getPatch =
async function getPatch (dep, hash) {
  dep = dep || await getLocalPackageName()
  const [org, repo] = await getGitHubOrgRepo(dep)
  hash = hash || await getCommitHash(org, repo)
  const patch = `${org}/${repo}#${hash}`
  return patch
}

const getLocalPackageName = module.exports.getLocalPackageName =
async function getLocalPackageName (pkgPath) {
  pkgPath = pkgPath || 'package.json'
  let pkg = await fsPromises.readFile(pkgPath).catch((err) => {
    throw (err)
  })
  pkg = JSON.parse(pkg)
  return pkg.name
}

const getGitHubOrgRepo = module.exports.getGitHubOrgRepo =
async function getGitHubOrgRepo (dep) {
  const urlRegex = /github.com\/([^/])+\/[^/]+/g
  const resp = await fetchRegistryInfo(dep)
  let org, repo
  if (resp.repository && resp.repository.url) {
    let gitUrl = (resp.repository.url).match(urlRegex)
    if (gitUrl) {
      gitUrl = gitUrl[0].replace(/(\.git)/g, '')
      org = getOrgRepo(gitUrl)[0]
      repo = getOrgRepo(gitUrl)[1]
    }
  }
  if (!org && !repo) {
    org = 'undefined'
    repo = 'undefined'
  }
  return [org, repo]
}

const fetchRegistryInfo = module.exports.fetchRegistryInfo =
async function fetchRegistryInfo (dep) {
  const resp = await fetch(`https://registry.npmjs.org/${dep}`)
  return resp.json()
}

const applyPatch = module.exports.applyPatch =
function applyPatch (patch, dep, packageJSON) {
  if (!Object.prototype.hasOwnProperty.call(packageJSON.dependencies, dep)) {
    throw new Error('Dependency not found in package.json')
  }
  packageJSON.dependencies[dep] = patch
  return packageJSON
}

async function pushPatch (packageJSON, owner, repo, dep) {
  const file = JSON.stringify(packageJSON, null, 2) + '\n' // assumes package.json is using two spaces
  const encodedFile = Buffer.from(file).toString('base64')
  const message = `wiby: update ${dep}`
  const branch = `wiby-${dep}`

  const [headSha, treeSha] = await github.getShas(owner, repo)
  const blobSha = await github.createBlob(owner, repo, encodedFile)
  const newTreeSha = await github.createTree(owner, repo, treeSha, blobSha)
  const commitSha = await github.createCommit(owner, repo, message, newTreeSha, headSha)
  await github.createBranch(owner, repo, commitSha, branch)
  console.log(`Changes pushed to https://github.com/${owner}/${repo}/blob/${branch}/package.json`)
}
