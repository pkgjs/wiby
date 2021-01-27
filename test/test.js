require('dotenv').config()
const fs = require('fs').promises
const tap = require('tap')
const path = require('path')
const nock = require('nock')
const CONFIG = require('./fixtures/config')
const pkgTest = require('../lib/test')

tap.beforeEach(async () => {
  nock.disableNetConnect()
})

tap.afterEach(async () => {
  nock.cleanAll()
  nock.enableNetConnect()
})

tap.test('Check if the dependency is listed in the package.json', tap => {
  tap.equal(pkgTest.checkPackageInPackageJSON(CONFIG.PKG_NAME_UNIT, CONFIG.PKGJSON), true, `expect ${CONFIG.PKG_NAME_UNIT} to be in pkg json`)
  tap.equal(pkgTest.checkPackageInPackageJSON(CONFIG.PKG_REPO, CONFIG.PKGJSON), false, `expect that repo name ${CONFIG.PKG_REPO} does not match scoped pkg name ${CONFIG.PKG_NAME_UNIT}`)
  tap.equal(pkgTest.checkPackageInPackageJSON('not-a-dep', CONFIG.PKGJSON), false)
  tap.end()
})

tap.test('Local package.json returned correctly', async tap => {
  const pkgPath = path.join(__dirname, 'fixtures', 'pass', 'package.json')
  const expectedPackageJSON = await fs.readFile(pkgPath)
  tap.looseEqual(await pkgTest.getLocalPackageJSON(pkgPath), JSON.parse(expectedPackageJSON))
})

tap.test('Check patch applied to package.json successfully', tap => {
  tap.equal(JSON.stringify(pkgTest.applyPatch(CONFIG.PATCH, CONFIG.PKG_NAME_UNIT, CONFIG.PKGJSON)), JSON.stringify(CONFIG.PATCHED_PKGJSON))
  tap.end()
})

tap.test('applyPatch() checks package exists in dependant package.json', tap => {
  tap.throws(
    function () {
      pkgTest.applyPatch(
        CONFIG.PATCH,
        CONFIG.PKG_NAME_UNIT,
        {
          dependencies: {
            'other-package': '*'
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
    pkgTest({ dependents: [{ repository: `https://www.github.com/${CONFIG.DEP_ORG}/${CONFIG.DEP_REPO}` }] }),
    new Error(`pkgjs/wiby not found in the package.json of ${CONFIG.DEP_ORG}/${CONFIG.DEP_REPO}`)
  )
  tap.end()
})
