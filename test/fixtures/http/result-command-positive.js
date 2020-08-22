/**
 * Mocks of HTTP calls for "wiby result" command positive flow
 */
const nock = require('nock')

nock('https://api.github.com', { allowUnmocked: false })
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
  .get('/repos/fakeOrg/fakeRepo/commits/wiby-wiby/check-runs')
  .reply(200, {
    check_runs: [
      { status: 'queued', name: 'fake_run' },
      { status: 'done', name: 'fake_run_2', conclusion: 'fake_conclusion' }
    ]
  })
