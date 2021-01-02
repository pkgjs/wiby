/**
 * Mocks of HTTP calls for "wiby result" command flow with empty response from check-runs
 */
const nock = require('nock')

nock('https://api.github.com')
  // get the default branch json
  .post('/graphql', /.*defaultBranchRef.*/gi)
  .times(3)
  .reply(200, {
    data: {
      repository: {
        defaultBranchRef: {
          name: 'main'
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
      // empty checks list
    ]
  })
  // get checks for ref
  .get('/repos/wiby-test/fakeRepo/commits/wiby-wiby/statuses')
  .reply(200, {
    check_runs: [
      { status: 'queued', name: 'fake_run' },
      { status: 'done', name: 'fake_run_2', conclusion: 'fake_conclusion' }
    ]
  })
