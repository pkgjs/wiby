'use strict'

require('dotenv').config()
const tap = require('tap')
const github = require('../../lib/github')
const CONFIG = require('../fixtures/config')

tap.test('package.json can be fetched with a valid url', async tap => {
  const packageJson = await github.getPackageJson(CONFIG.DEP_ORG, CONFIG.DEP_REPO)
  tap.match(packageJson, { ...CONFIG.PKGJSON, dependencies: { [CONFIG.PKG_NAME_INTEGRATION]: '*' } })
}, { skip: !process.env.GITHUB_TOKEN })

tap.test('Shas returned from getShas', async tap => {
  const { headSha, treeSha } = await github.getShas('pkgjs', 'wiby')
  tap.notEqual(headSha, null)
  tap.notEqual(treeSha, null)
}, { skip: !process.env.GITHUB_TOKEN })

tap.test('Checks fetched for a GitHub repo', async tap => {
  tap.equal((await github.getChecks('pkgjs', 'wiby', 'HEAD')).status, 200)
}, { skip: !process.env.GITHUB_TOKEN })

tap.test('Checks fetched for a GitHub repo', async tap => {
  tap.equal((await github.getCommitStatusesForRef('pkgjs', 'wiby', 'HEAD')).status, 200)
}, { skip: !process.env.GITHUB_TOKEN })
