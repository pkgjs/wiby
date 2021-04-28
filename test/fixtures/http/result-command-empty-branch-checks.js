'use strict'

/**
 * Mocks of HTTP calls for "wiby result" command flow with empty response from check-runs
 */
const nock = require('nock')

nock.disableNetConnect()

nock('https://api.github.com')
  // get package json
  .post('/graphql')
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
  .get('/repos/wiby-test/fakeRepo/branches/wiby-running-unit-tests')
  .reply(200, {})
  // get check results
  .get('/repos/wiby-test/fakeRepo/commits/wiby-running-unit-tests/check-runs')
  .reply(200, {
    check_runs: [
      // empty checks list
    ]
  })
  // get checks for ref
  .get('/repos/wiby-test/fakeRepo/commits/wiby-running-unit-tests/statuses')
  .reply(200, {
    check_runs: [
      { status: 'queued', name: 'fake_run' },
      { status: 'done', name: 'fake_run_2', conclusion: 'fake_conclusion' }
    ]
  })
