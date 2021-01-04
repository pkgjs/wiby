/**
 * Mocks of HTTP calls for "wiby result" command positive flow
 */
const nock = require('nock')
require('../../../lib/logger').enableLogs()

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
  .get('/repos/wiby-test/fakeRepo/commits/wiby-wiby/check-runs')
  .reply(200, {
    check_runs: [
      { status: 'queued', name: 'fake_run' },
      { status: 'done', name: 'fake_run_2', conclusion: 'fake_conclusion' }
    ]
  })
  .get('/repos/wiby-test/fail/commits/wiby-wiby/check-runs')
  .reply(200, {
    check_runs: [
      { status: 'queued', name: 'fail_run' },
      { status: 'done', name: 'fail_run_2', conclusion: 'fake_conclusion' }
    ]
  })
  .get('/repos/wiby-test/pass/commits/wiby-wiby/check-runs')
  .reply(200, {
    check_runs: [
      { status: 'queued', name: 'pass_run' },
      { status: 'done', name: 'pass_run_2', conclusion: 'fake_conclusion' }
    ]
  })
  .get('/repos/wiby-test/partial/commits/wiby-wiby/check-runs')
  .reply(200, {
    check_runs: [
      { status: 'queued', name: 'partial_run' },
      { status: 'done', name: 'partial_run_2', conclusion: 'fake_conclusion' }
    ]
  })
