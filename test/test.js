require('dotenv').config()
const tap = require('tap')
const path = require('path')
const CONFIG = require('./fixtures/config')
const localPkg = require('./fixtures/package.json')
const pkgTest = require('../lib/test')

tap.test('Test correct sha returned for a GitHub repository', async tap => {
  tap.equal(await pkgTest.getCommitHash(CONFIG.PKG_ORG, CONFIG.PKG_REPO), CONFIG.PKG_HEAD_SHA)
})

tap.test('Check if the dependency is listed in the package.json', tap => {
  tap.equal(pkgTest.checkPackageInPackageJSON(CONFIG.PKG_NAME, CONFIG.PKGJSON), true)
  tap.equal(pkgTest.checkPackageInPackageJSON('not-a-dep', CONFIG.PKGJSON), false)
  tap.end()
})

tap.test('GitHub organisation/owner and repository returned', tap => {
  tap.equal(pkgTest.getOrgRepo(CONFIG.DEP_URL)[0], CONFIG.DEP_ORG)
  tap.equal(pkgTest.getOrgRepo(CONFIG.DEP_URL)[1], CONFIG.DEP_REPO)
  tap.end()
})

tap.test('patch created from github org repo and commit sha', async tap => {
  tap.equal(await pkgTest.getPatch(CONFIG.PKG_NAME, CONFIG.PKG_HEAD_SHA), CONFIG.PATCH)
})

tap.test('Local package.json name returned correctly', async tap => {
  const pkgPath = path.join(__dirname, '/fixtures/package.json')
  tap.equal(await pkgTest.getLocalPackageName(pkgPath), localPkg.name)
})

tap.test('GitHub org and repo returned when given package name', async tap => {
  tap.equal((await pkgTest.getGitHubOrgRepo(CONFIG.PKG_NAME))[0], CONFIG.PKG_ORG)
  tap.equal((await pkgTest.getGitHubOrgRepo(CONFIG.PKG_NAME))[1], CONFIG.PKG_REPO)
})

tap.test('Check registry info is fetched correctly', async tap => {
  tap.equal((await pkgTest.fetchRegistryInfo(CONFIG.PKG_NAME))._id, CONFIG.PKG_NAME)
})

tap.test('undefined returned when given an invalid package name', async tap => {
  tap.equal((await pkgTest.getGitHubOrgRepo('not-a-package'))[0], 'undefined')
  tap.equal((await pkgTest.getGitHubOrgRepo('not-a-package'))[1], 'undefined')
})

tap.test('Check patch applied to package.json successfully', tap => {
  tap.equal(JSON.stringify(pkgTest.applyPatch(CONFIG.PATCH, CONFIG.PKG_NAME, CONFIG.PKGJSON)), JSON.stringify(CONFIG.PATCHED_PKGJSON))
  tap.end()
})
