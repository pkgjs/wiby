'use strict'

/**
 * Mocks of HTTP calls for "wiby test" command positive flow
 */
const nock = require('nock')

nock.disableNetConnect()

function nockPkgjsWiby (nockInstance) {
  return nockInstance
    // get package json
    .post('/graphql', body => !!body.query.match(/HEAD/g))
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
    .post(/graphql/, body => !!body.query.match(/defaultBranchRef/g))
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
    // get commit sha
    .get('/repos/pkgjs/wiby/commits?per_page=1')
    .reply(200, [
      {
        sha: 'fake_sha',
        commit: {
          tree: {
            sha: 'fake_sha'
          }
        }
      }
    ])
    .get('/repos/wiby-test/pass/branches/wiby-running-unit-tests')
    .reply(404, {})
}

function nockRepo (nockInstance, repo) {
  return nockInstance
    // get dependent commit sha
    .get(`/repos/wiby-test/${repo}/commits?per_page=1`)
    .reply(200, [
      {
        sha: 'fake_sha',
        commit: {
          tree: {
            sha: 'fake_sha'
          }
        }
      }
    ])
    // create blob
    .post(`/repos/wiby-test/${repo}/git/blobs`)
    .reply(200, {
      sha: 'fake_sha'
    })
    // create tree
    .post(`/repos/wiby-test/${repo}/git/trees`)
    .reply(200, {
      sha: 'fake_sha'
    })
    // create commit in dependent
    .post(`/repos/wiby-test/${repo}/git/commits`)
    .reply(200, {
      sha: 'fake_sha'
    })
    // create branch in dependent
    .post(`/repos/wiby-test/${repo}/git/refs`)
    .reply(200, {})
    // create PR when requested
    .post(`/repos/wiby-test/${repo}/pulls`)
    .reply(201, {
      html_url: 'https://github.com/pkgjs/wiby/pull/1'
    })
    .get('/repos/wiby-test/pass/branches/running-unit-tests')
    .reply(200, {
      name: 'running-unit-tests'
    })
}

function buildNock () {
  let nockInstance = nock('https://api.github.com')

  nockInstance = nockPkgjsWiby(nockInstance)
  nockInstance = nockRepo(nockInstance, 'fakeRepo')
  nockInstance = nockRepo(nockInstance, 'fail')
  nockInstance = nockRepo(nockInstance, 'pass')
  nockInstance = nockRepo(nockInstance, 'partial')

  return nockInstance
}

buildNock()
