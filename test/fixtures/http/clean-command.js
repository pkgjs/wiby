'use strict'

/**
 * Mocks of HTTP calls for "wiby clean" command
 */
const nock = require('nock')

nock.disableNetConnect()

function nockRepo (nockInstance, repo) {
  return nockInstance
    .get(`/repos/wiby-test/${repo}/branches/wiby-wiby`)
    .reply(200)
    .delete(`/repos/wiby-test/${repo}/git/refs/heads%2Fwiby-wiby`)
    .reply(200)
}

function buildNock () {
  let nockInstance = nock('https://api.github.com')

  nockInstance = nockRepo(nockInstance, 'fakeRepo')
  nockInstance = nockRepo(nockInstance, 'fail')
  nockInstance = nockRepo(nockInstance, 'pass')
  nockInstance = nockRepo(nockInstance, 'partial')

  return nockInstance
}

buildNock()
