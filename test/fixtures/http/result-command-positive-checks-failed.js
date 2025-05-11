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
  // get check results
  .get('/repos/wiby-test/fakeRepo/commits/wiby-running-unit-tests/check-runs')
  .reply(200, {
    check_runs: [
      { status: 'done', name: 'fake_run', conclusion: 'failure' }
    ]
  })
