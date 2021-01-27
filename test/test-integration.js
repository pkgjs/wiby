require('dotenv').config()
const tap = require('tap')
const CONFIG = require('./fixtures/config')
const pkgTest = require('../lib/test')

tap.test('Test correct sha returned for a GitHub repository', async tap => {
  tap.equal(await pkgTest.getCommitHash(CONFIG.DEP_ORG, CONFIG.DEP_REPO), CONFIG.DEP_HEAD_SHA)
}, { skip: !process.env.GITHUB_TOKEN })

tap.test('commit url created from github org repo and commit sha', async tap => {
  tap.equal(await pkgTest.getCommitURL(CONFIG.PKG_ORG, CONFIG.PKG_NAME_INTEGRATION, CONFIG.PKG_HEAD_SHA), CONFIG.PATCH)
}, { skip: !process.env.GITHUB_TOKEN })
