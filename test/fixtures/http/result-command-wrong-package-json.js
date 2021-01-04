/**
 * Mocks of HTTP calls for "wiby result" command flow with package.json without expected dependency
 */
const nock = require('nock')
require('../../../lib/logger').enableLogs()

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
