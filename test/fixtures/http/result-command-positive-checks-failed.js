'use strict'

/**
 * Mocks of HTTP calls for "wiby result" command
 * Checks returned with status failure
 */
const nock = require('nock')

nock.disableNetConnect()

nock('https://api.github.com')
  // get package json
  .post('/graphql')
  .times(3)
  .reply(200, {
    data: {
      repository: {
        object: {
          text: JSON.stringify({
            dependencies: {
              wiby: '*'
            }
          })
        }
      }
    }
  })
  // get check results
  .get('/repos/wiby-test/fakeRepo/commits/wiby-branch-naming/check-runs')
  .reply(200, {
    check_runs: [
      { status: 'done', name: 'fake_run', conclusion: 'failure' }
    ]
  })
