/**
 * Mocks of HTTP calls for "wiby test" command positive flow
 */
const nock = require('nock')

function nockPkgjsWiby (nockInstance) {
  return nockInstance
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
