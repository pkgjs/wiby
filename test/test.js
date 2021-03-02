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

tap.test('Check patch applied to dependency package.json successfully', tap => {
  tap.equal(JSON.stringify(wiby.test.applyPatch(CONFIG.PATCH, CONFIG.PKG_NAME_UNIT, CONFIG.PKGJSON)), JSON.stringify(CONFIG.PATCHED_PKGJSON))
  tap.end()
})
tap.test('Check patch applied to dev dependency package.json successfully', tap => {
  tap.equal(JSON.stringify(wiby.test.applyPatch(CONFIG.DEV_DEP_PATCH, CONFIG.DEV_DEP_PKG_NAME_UNIT, CONFIG.PKGJSON_DEV_DEPS)), JSON.stringify(CONFIG.PATCHED_DEV_DEPS_PKGJSON))
  tap.end()
})

tap.test('Check patch applied to peer dependency package.json successfully', tap => {
  tap.equal(JSON.stringify(wiby.test.applyPatch(CONFIG.PEER_DEP_PATCH, CONFIG.DEV_PEER_PKG_NAME_UNIT, CONFIG.PKGJSON_PEER_DEPS)), JSON.stringify(CONFIG.PATCHED_PEER_DEPS_PKGJSON))
  tap.end()
})

tap.test('applyPatch() checks package exists in dependant package.json', tap => {
  tap.throws(
    function () {
      wiby.test.applyPatch(
        CONFIG.PATCH,
        CONFIG.PKG_NAME_UNIT,
        {
          dependencies: {
            'other-package': '*'
          },
          devDependencies: {
            'further-packages': '*'
          },
          peerDependencies: {
            'some-plugin': '*'
          },
          optionalDependencies: {
            'some-optional-dep': '*'
          }
        }
      )
    },
    new Error('Dependency not found in package.json')
  )
  tap.end()
})

tap.test('test command checks package exists in dependant package.json', tap => {
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

  tap.rejects(
    wiby.test({ dependents: [{ repository: `https://www.github.com/${CONFIG.DEP_ORG}/${CONFIG.DEP_REPO}` }] }),
    new Error(`pkgjs/wiby not found in the package.json of ${CONFIG.DEP_ORG}/${CONFIG.DEP_REPO}`)
  )
  tap.end()
})
