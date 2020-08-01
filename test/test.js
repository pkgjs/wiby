require('dotenv').config()
const fs = require('fs').promises
const tap = require('tap')
const path = require('path')
const CONFIG = require('./fixtures/config')
const pkgTest = require('../lib/test')

tap.test('Test correct sha returned for a GitHub repository', async tap => {
  tap.equal(await pkgTest.getCommitHash(CONFIG.PKG_ORG, CONFIG.PKG_REPO), CONFIG.PKG_HEAD_SHA)
})

tap.test('Check if the dependency is listed in the package.json', tap => {
  tap.equal(pkgTest.checkPackageInPackageJSON(CONFIG.PKG_NAME, CONFIG.PKGJSON), true)
  tap.equal(pkgTest.checkPackageInPackageJSON('not-a-dep', CONFIG.PKGJSON), false)
  tap.end()
})

tap.test('commit url created from github org repo and commit sha', async tap => {
  tap.equal(await pkgTest.getCommitURL(CONFIG.PKG_ORG, CONFIG.PKG_NAME, CONFIG.PKG_HEAD_SHA), CONFIG.PATCH)
})

tap.test('Local package.json returned correctly', async tap => {
  const pkgPath = path.join(__dirname, 'fixtures', 'pass', 'package.json')
  const expectedPackageJSON = await fs.readFile(pkgPath)
  tap.looseEqual(await pkgTest.getLocalPackageJSON(pkgPath), JSON.parse(expectedPackageJSON))
})

tap.test('Check patch applied to package.json successfully', tap => {
  tap.equal(JSON.stringify(pkgTest.applyPatch(CONFIG.PATCH, CONFIG.PKG_NAME, CONFIG.PKGJSON)), JSON.stringify(CONFIG.PATCHED_PKGJSON))
  tap.end()
})
