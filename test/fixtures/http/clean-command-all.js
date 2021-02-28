'use strict'

/**
 * Mocks of HTTP calls for "wiby clean" command
 */
const nock = require('nock')

nock.disableNetConnect()

function nockRepo (nockInstance, repo) {
  return nockInstance
    .post('/graphql')
    .reply(200, (uri, body) => {
      const repo = body.variables.repo

      return {
        data: {
          organization: {
            repository: {
              name: 'pass',
              refs: {
                edges: [
                  {
                    node: {
                      branchName: `wiby-${repo}-one`
                    }
                  },
                  {
                    node: {
                      branchName: `wiby-${repo}-two`
                    }
                  }
                ]
              }
            }
          }
        }
      }
    })
    .delete(`/repos/wiby-test/${repo}/git/refs/heads%2Fwiby-pass-one`)
    .reply(200)
    .delete(`/repos/wiby-test/${repo}/git/refs/heads%2Fwiby-pass-two`)
    .reply(200)
    .delete(`/repos/wiby-test/${repo}/git/refs/heads%2Fwiby-fail-one`)
    .reply(200)
    .delete(`/repos/wiby-test/${repo}/git/refs/heads%2Fwiby-fail-two`)
    .reply(200)
    .delete(`/repos/wiby-test/${repo}/git/refs/heads%2Fwiby-partial-one`)
    .reply(200)
    .delete(`/repos/wiby-test/${repo}/git/refs/heads%2Fwiby-partial-two`)
    .reply(200)
}

function buildNock () {
  let nockInstance = nock('https://api.github.com')

  nockInstance = nockRepo(nockInstance, 'fail')
  nockInstance = nockRepo(nockInstance, 'pass')
  nockInstance = nockRepo(nockInstance, 'partial')

  return nockInstance
}

buildNock()
