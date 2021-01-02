require('dotenv').config()
const tap = require('tap')
const nock = require('nock')
const result = require('../lib/result')
const checks = require('./fixtures/checks')
const CONFIG = require('./fixtures/config')

tap.beforeEach(async () => {
  nock.disableNetConnect()
})

tap.afterEach(async () => {
  nock.cleanAll()
  nock.enableNetConnect()
})

tap.test('Test correct branch name is returned', async tap => {
  tap.equal(await result.getBranchName('wiby'), 'wiby-wiby')
})

tap.test('Test correct status returned from getResultForEachRun', tap => {
  tap.equal(result.getResultForEachRun(checks).toString(), checks.expected.toString())
  tap.end()
})

tap.test('result command checks package exists in dependant package.json', tap => {
  nock('https://api.github.com')
    // get default branch
    .post('/graphql')
    .once()
    .reply(200, {
      data: {
        repository: {
          defaultBranchRef: {
            name: 'master'
          }
        }
      }
    })
    // get package json
    .post('/graphql')
    .reply(200, {
      data: {
        repository: {
          object: {
            text: JSON.stringify({
              dependencies: {
                'other-package': '*'
              }
            })
          }
        }
      }
    })

  tap.rejects(
    result({ dependents: [{ repository: `https://www.github.com/${CONFIG.DEP_ORG}/${CONFIG.DEP_REPO}` }] }),
    new Error(`pkgjs/wiby not found in the package.json of ${CONFIG.DEP_ORG}/${CONFIG.DEP_REPO}`)
  )
  tap.end()
})
