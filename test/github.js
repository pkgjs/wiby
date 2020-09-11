require('dotenv').config()
const nock = require('nock')
const tap = require('tap')
const github = require('../lib/github')
const CONFIG = require('./fixtures/config')

tap.test('package.json can be fetched with a valid url', async tap => {
  tap.equal(JSON.stringify(await github.getPackageJson(CONFIG.DEP_ORG, CONFIG.DEP_REPO)), JSON.stringify(CONFIG.PKGJSON))
}, { skip: !process.env.GITHUB_TOKEN })

tap.test('getPackageJson() handles NotFound reposiptory error', async tap => {
  nock('https://api.github.com', { allowUnmocked: true })
    .post('/graphql')
    .reply(404, {
      errors: [
        { type: 'NOT_FOUND' }
      ]
    })

  tap.rejects(
    github.getPackageJson(CONFIG.DEP_ORG, CONFIG.DEP_REPO),
    new Error(`Could not find GitHub repository at https://www.github.com/${CONFIG.DEP_ORG}/${CONFIG.DEP_REPO}`)
  )
})

tap.test('getPackageJson() handles general error', async tap => {
  nock('https://api.github.com', { allowUnmocked: true })
    .post('/graphql')
    .reply(500)

  tap.rejects(
    github.getPackageJson(CONFIG.DEP_ORG, CONFIG.DEP_REPO)
  )
})

tap.test('correct permissions returned for GitHub repo', async tap => {
  tap.equal((await github.getPermissions(CONFIG.DEP_ORG, CONFIG.DEP_REPO)), CONFIG.DEP_REPO_PERM)
}, { skip: !process.env.GITHUB_TOKEN })

tap.test('getPermissions() handles NotFound reposiptory error', async tap => {
  nock('https://api.github.com', { allowUnmocked: true })
    .post('/graphql')
    .reply(404, {
      errors: [
        { type: 'NOT_FOUND' }
      ]
    })

  tap.rejects(
    github.getPermissions(CONFIG.DEP_ORG, CONFIG.DEP_REPO),
    new Error(`Could not find GitHub repository at https://www.github.com/${CONFIG.DEP_ORG}/${CONFIG.DEP_REPO}`)
  )
})

tap.test('getPermissions() handles general error', async tap => {
  nock('https://api.github.com', { allowUnmocked: true })
    .post('/graphql')
    .reply(500)

  tap.rejects(
    github.getPermissions(CONFIG.DEP_ORG, CONFIG.DEP_REPO)
  )
})

tap.test('Shas returned from getShas', async tap => {
  const [headSha, treeSha] = await github.getShas('pkgjs', 'wiby')
  tap.notEqual(headSha, null)
  tap.notEqual(treeSha, null)
}, { skip: !process.env.GITHUB_TOKEN })

tap.test('Checks fetched for a GitHub repo', async tap => {
  tap.equal((await github.getChecks('pkgjs', 'wiby', 'master')).status, 200)
}, { skip: !process.env.GITHUB_TOKEN })

tap.test('Checks fetched for a GitHub repo', async tap => {
  tap.equal((await github.getCommitStatusesForRef('pkgjs', 'wiby', 'master')).status, 200)
}, { skip: !process.env.GITHUB_TOKEN })
