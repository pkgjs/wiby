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

tap.test('result() should return correct data object', async tap => {
  // mock reall http requests with positive scenario
  require('./fixtures/http/result-command-positive')

  const output = await result({ dependents: [{ repository: 'https://github.com/wiby-test/fakeRepo' }] })

  tap.equal(output.status, 'failure')
  tap.equal(output.results[0].dependent, 'wiby-test/fakeRepo')
  tap.equal(output.results[0].status, 'failure')
  tap.equal(output.results[0].runs.length, 2)
})

tap.test('should correctly detect overall status for runs results', async tap => {
  const failedCasesPresent = [
    [null, 'failure'],
    [null, 'success'],
    [null, 'success']
  ]

  const unexpectedCasesPresent = [
    [null, 'unexpectedStatus'],
    [null, 'success'],
    [null, 'success']
  ]

  const nullCasesPresent = [
    [null, null],
    [null, 'success'],
    [null, 'success']
  ]

  const pendingCasesPresent = [
    [null, 'pending'],
    [null, 'success'],
    [null, 'success']
  ]

  const successCasesPresent = [
    [null, 'success'],
    [null, 'success'],
    [null, 'success']
  ]

  tap.equal(result.getOverallStatusForAllRuns(failedCasesPresent), 'failure')
  tap.equal(result.getOverallStatusForAllRuns(unexpectedCasesPresent), 'failure')
  tap.equal(result.getOverallStatusForAllRuns(nullCasesPresent), 'pending')
  tap.equal(result.getOverallStatusForAllRuns(pendingCasesPresent), 'pending')
  tap.equal(result.getOverallStatusForAllRuns(successCasesPresent), 'success')
})
