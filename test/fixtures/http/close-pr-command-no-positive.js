'use strict'

/*
 Mocks of HTTP calls for close-pr command
 */
const nock = require('nock')

nock.disableNetConnect()

function nockRepo (nockInstance, owner, repo, branch) {
  return nockInstance
    // /repos/{owner}/{repo}/commits/{ref}/check-runs
    .get(`/repos/${owner}/${repo}/commits/${branch}/check-runs`)
    .reply(200, {
      check_runs: [
        {
          status: 'completed',
          conclusion: 'failure',
          pull_requests: [{
            number: 1,
            head: {
              ref: branch
            }
          }, {
            status: 'completed',
            conclusion: 'failure',
            number: 2,
            head: {
              ref: 'any-other-branch'
            }
          }]
        }
      ]
    })
}

function buildNock () {
  let nockInstance = nock('https://api.github.com')

  nockInstance = nockRepo(nockInstance, 'wiby-test', 'fakeRepo', 'wiby-running-unit-tests')
  nockInstance = nockRepo(nockInstance, 'wiby-test', 'pass', 'wiby-running-unit-tests')
  return nockInstance
}

buildNock()
