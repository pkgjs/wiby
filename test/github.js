require('dotenv').config()
const tap = require('tap')
const github = require('../lib/github')
const CONFIG = require('./fixtures/config')

if (process.env.GITHUB_TOKEN) {
  tap.test('package.json can be fetched with a valid url', async tap => {
    tap.equal(JSON.stringify(await github.getPackageJson(CONFIG.DEP_ORG, CONFIG.DEP_REPO)), JSON.stringify(CONFIG.PKGJSON))
    // tap.throws( await pkgTest.getPackageJson('not-an-org', 'not-a-repo'))
  })

  tap.test('correct permissions returned for GitHub repo', async tap => {
    tap.equal((await github.getPermissions(CONFIG.DEP_ORG, CONFIG.DEP_REPO)), CONFIG.DEP_REPO_PERM)
  })
}
