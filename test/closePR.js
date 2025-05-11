const nock = require('nock')
const tap = require('tap')
const context = require('../lib/context')
const gitFixture = require('./fixtures/git')
const closePR = require('../lib/closePR')

tap.test('close PR', (t) => {
  t.beforeEach(async () => {
    process.env.GITHUB_TOKEN = 'ghp_123_abc'
  })

  t.test('checks on internal call to github', (t) => {
    const owner = 'pkgjs'
    const repo = 'wiby'
    const branch = 'wiby-main'
    t.plan(6)
    t.test('no checkruns returns', async (t) => {
      const result = await closePR.closeDependencyPR(owner, repo, branch, null)
      t.equal(result, undefined)
    })
    t.test('status not completed returns empty array', async (t) => {
      const result = await closePR.closeDependencyPR(owner, repo, branch, [{ status: 'queued' }])
      t.equal(result.length, 0)
    })
    t.test('conclusion not a success returns empty array', async (t) => {
      const result = await closePR.closeDependencyPR(owner, repo, branch, [{ status: 'queued', conclusion: 'failure' }])
      t.equal(result.length, 0)
    })
    t.test('no pull requests returns empty array', async (t) => {
      const result = await closePR.closeDependencyPR(owner, repo, branch, [{
        status: 'completed',
        conclusion: 'success'
      }])
      t.equal(result.length, 0)
    })
    t.test('empty pull requests returns empty array', async (t) => {
      const result = await closePR.closeDependencyPR(owner, repo, branch, [{
        status: 'completed',
        conclusion: 'success',
        pull_requests: []
      }])
      t.equal(result.length, 0)
    })
    t.test('pull requests with numbers returns values', async (t) => {
      nock('https://api.github.com')
        // get package json
        .patch('/repos/pkgjs/wiby/pulls/1')
        .reply(200, {})
      const result = await closePR.closeDependencyPR(owner, repo, branch, [{
        status: 'completed',
        conclusion: 'success',
        pull_requests: [{
          number: 1,
          head: {
            ref: branch
          }
        }, {
          number: 2,
          head: {
            ref: 'any-other-branch'
          }
        }]
      }])
      t.equal(result.length, 1)
    })
  })
  t.test('closePR Cli function tests', (t) => {
    t.plan(2)
    t.test('closePR should not close PRs', async (t) => {
      // nock setup
      nock('https://api.github.com')
        .get(/repos.*check-runs/)
        .reply(200, {})
      const result = await closePR({
        dependents: [
          {
            repository: 'https://github.com/wiby-test/fakeRepo',
            pullRequest: true
          }
        ]
      })

      t.equal(result.length, 0)
    })
    t.test('closePR should close a single PR', async (t) => {
      gitFixture.init()
      const branch = context.getTestingBranchName(await context.getParentBranchName())
      // nock setup
      nock('https://api.github.com')
        .get(/repos.*check-runs/)
        .reply(200, {
          check_runs: [
            {
              status: 'completed',
              conclusion: 'success',
              pull_requests: [{
                number: 1,
                head: {
                  ref: branch
                }
              }, {
                number: 2,
                head: {
                  ref: 'any-other-branch'
                }
              }]
            }
          ]
        })
        .patch(/repos.*pulls\/1/)
        .reply(200, {
          state: 'closed',
          title: 'wiby test pr'
        })
      const result = await closePR({
        dependents: [
          {
            repository: 'https://github.com/wiby-test/fakeRepo1'
          },
          {
            repository: 'https://github.com/wiby-test/fakeRepo2',
            pullRequest: true
          }
        ]
      })

      t.equal(result.length, 1)
    })
  })
  t.end()
})
