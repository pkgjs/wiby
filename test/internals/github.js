'use strict'

require('dotenv').config()
const nock = require('nock')
const tap = require('tap')
const github = require('../../lib/github')
const CONFIG = require('../fixtures/config')

tap.test('tests for lib/github.js', async (tap) => {
  tap.beforeEach(async () => {
    nock.disableNetConnect()
  })

  tap.afterEach(async () => {
    nock.cleanAll()
    nock.enableNetConnect()
  })

  tap.test('getPackageJson() handles NotFound repository error', async (tap) => {
    nock('https://api.github.com')
      .post('/graphql')
      .reply(404, {
        errors: [
          { type: 'NOT_FOUND' }
        ]
      })

    tap.rejects(
      github.getPackageJson(CONFIG.DEP_ORG, CONFIG.DEP_REPO),
      new Error(`Could not find GitHub repository at https://www.github.com/${CONFIG.DEP_ORG}/${CONFIG.DEP_REPO}`)
    )
  })

  tap.test('getPackageJson() handles general error', async (tap) => {
    nock('https://api.github.com')
      .post('/graphql')
      .reply(500)

    tap.rejects(
      github.getPackageJson(CONFIG.DEP_ORG, CONFIG.DEP_REPO)
    )
  })

  tap.test('getPackageJson() handles without files', async (tap) => {
    nock('https://api.github.com')
      .post('/graphql')
      .reply(200, {
        data: {
          repository: {
            object: {
              tree: {
                entries: null
              }
            }
          }
        }
      })

    tap.rejects(
      github.getPackageJson(CONFIG.DEP_ORG, CONFIG.DEP_REPO),
      new Error('Could not find the package.json in the repository')
    )
  })
})
