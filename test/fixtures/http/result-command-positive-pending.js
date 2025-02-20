'use strict'

/**
 * Mocks of HTTP calls for "wiby result" command positive flow
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
          tree: {
            entries: [
              {
                name: 'package.json',
                object: {
                  text: JSON.stringify({
                    dependencies: {
                      wiby: '*'
                    }
                  })
                }
              }
            ]
          }
        }
      }
    }
  })
  .get('/repos/wiby-test/fakeRepo/branches/wiby-running-unit-tests')
  .reply(200, {})
  .get('/repos/wiby-test/partial/branches/wiby-running-unit-tests')
  .reply(200, {})
  .get('/repos/wiby-test/pass/branches/wiby-running-unit-tests')
  .reply(200, {})
  .get('/repos/wiby-test/fail/branches/wiby-running-unit-tests')
  .reply(200, {})
  // get check results
  .get('/repos/wiby-test/fakeRepo/commits/wiby-running-unit-tests/check-runs')
  .reply(200, {
    check_runs: [
      { status: 'queued', name: 'fake_run' },
      { status: 'done', name: 'fake_run_2', conclusion: 'fake_conclusion' }
    ]
  })
  .get('/repos/wiby-test/fail/commits/wiby-running-unit-tests/check-runs')
  .reply(200, {
    check_runs: [
      { status: 'queued', name: 'fail_run' },
      { status: 'done', name: 'fail_run_2', conclusion: 'fake_conclusion' }
    ]
  })
  .get('/repos/wiby-test/pass/commits/wiby-running-unit-tests/check-runs')
  .reply(200, {
    check_runs: [
      { status: 'queued', name: 'pass_run' },
      { status: 'done', name: 'pass_run_2', conclusion: 'fake_conclusion' }
    ]
  })
  .get('/repos/wiby-test/partial/commits/wiby-running-unit-tests/check-runs')
  .reply(200, {
    check_runs: [
      { status: 'queued', name: 'partial_run' },
      { status: 'done', name: 'partial_run_2', conclusion: 'fake_conclusion' }
    ]
  })
