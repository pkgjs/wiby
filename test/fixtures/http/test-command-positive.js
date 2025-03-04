'use strict'

/**
 * Mocks of HTTP calls for "wiby test" command positive flow
 */
const nock = require('nock')

nock.disableNetConnect()

function nockPkgjsWiby (nockInstance) {
  return nockInstance
    // get package json
    .post('/graphql', body => !!body.query.match(/\$sha/g))
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
    .reply(404)
}

function nockRepo (nockInstance, repo) {
  return nockInstance
    // get dependent commit sha without branch Defined
    .get(`/repos/wiby-test/${repo}/commits?sha=HEAD&per_page=1`)
    .filteringPath(/sha=[^&]*/g, 'sha=HEAD')
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
    // get dependent commit sha with branch Defined
    .get(`/repos/wiby-test/${repo}/commits?sha=fake&per_page=1`)
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
    .get(`/repos/wiby-test/${repo}/branches/running-unit-tests`)
    .reply(200, {
      name: 'running-unit-tests',
      commit: {
        sha: 'head_sha',
        commit: {
          tree: {
            sha: 'tree_sha'
          }
        }
      }
    })
    .get(`/repos/wiby-test/${repo}/branches/wiby-running-unit-tests`)
    .reply(404)
    .get(`/repos/wiby-test/${repo}/branches/existing-branch`)
    .reply(404)
    .get(`/repos/wiby-test/${repo}/branches/wiby-existing-branch`)
    .reply(200, {
      name: 'wiby-existing-branch',
      commit: {
        sha: 'head_sha',
        commit: {
          tree: {
            sha: 'tree_sha'
          }
        }
      }
    })
    .patch(`/repos/wiby-test/${repo}/git/refs/heads%2Fwiby-existing-branch`, { sha: 'fake_sha' })
    .reply(204)
    .get(`/repos/wiby-test/${repo}/pulls?head=wiby-test%3Awiby-running-unit-tests`)
    .reply(200, [])
    .get(`/repos/wiby-test/${repo}/pulls?head=wiby-test%3Awiby-existing-branch`)
    .reply(200, [
      {
        html_url: 'https://github.com/pkgjs/wiby/pull/1'
      }
    ])
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
