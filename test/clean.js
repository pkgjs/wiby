'use strict'

require('dotenv').config()
const tap = require('tap')
const nock = require('nock')
const CONFIG = require('./fixtures/config')
const wiby = require('..')

tap.beforeEach(async () => {
  nock.disableNetConnect()
})

tap.afterEach(async () => {
  nock.cleanAll()
  nock.enableNetConnect()
})

tap.test('wiby.clean()', async (tap) => {
  tap.test('should check if the wiby branch exists', async (tap) => {
    nock('https://api.github.com')
      .get(`/repos/wiby-test/${CONFIG.DEP_REPO}/branches/wiby-wiby`)
      .reply(404)

    await wiby.clean({ dependents: [{ repository: `https://www.github.com/${CONFIG.DEP_ORG}/${CONFIG.DEP_REPO}` }] }, {})

    // implied assertion - no DELETE requests expected - we don't need to delete the missing `wiby-wiby` branch
  })

  tap.test('should rethrow when github API inaccessible during branch check', async (tap) => {
    nock('https://api.github.com')
      .get(`/repos/wiby-test/${CONFIG.DEP_REPO}/branches/wiby-wiby`)
      .reply(500)

    await tap.rejects(
      wiby.clean({ dependents: [{ repository: `https://www.github.com/${CONFIG.DEP_ORG}/${CONFIG.DEP_REPO}` }] }, {})
    )
  })
})
