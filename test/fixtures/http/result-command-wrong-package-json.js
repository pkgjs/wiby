/**
 * Mocks of HTTP calls for "wiby result" command flow with package.json without expected dependency
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
              'other-package': '*'
            }
          })
        }
      }
    }
  })
