'use strict'

const path = require('path')
const tap = require('tap')

const gitFixture = require('./fixtures/git')

const wiby = require('..')

const semver = require('semver')
const isGTE20 = semver.satisfies(process.versions.node, '>= 20')
const isGTE22 = semver.satisfies(process.versions.node, '>= 22')

const invalidConfigs = {
  'fail-bad-json.json': isGTE20 ? `${path.resolve(path.join(__dirname, 'fixtures', 'config', 'fail-bad-json.json'))}: Expected ':' after property name in JSON at position 23${isGTE22 ? ' (line 2 column 1)' : ''}"` : 'Unexpected end of JSON input',
  'fail-unknown-root-key.json': '"not-allowed" is not allowed',
  'fail-unknown-dependent-key.json': '"dependents[0].sub-key-not-allowed" is not allowed',
  'fail-dependent-not-url.json': '"dependents[0].repository" must be a valid uri'
}

const validConfigs = [
  'pass-empty.json',
  'pass-empty-dependents.json',
  'pass-wiby.js'
]

tap.test('config validation', async (tap) => {
  tap.beforeEach(async () => {
    gitFixture.init()
  })

  tap.test('should pass with the .wiby.json of the wiby itself', (tap) => {
    const normalizedConfig = wiby.validate({})
    tap.strictSame(normalizedConfig, {
      dependents: [
        {
          repository: 'https://github.com/wiby-test/partial',
          pullRequest: false,
          sha: 'HEAD',
          mode: "pull-request"
        },
        {
          repository: 'git://github.com/wiby-test/fail',
          pullRequest: false,
          sha: 'HEAD',
          mode: "pull-request"
        },
        {
          repository: 'git+https://github.com/wiby-test/pass',
          pullRequest: true,
          sha: 'HEAD',
          mode: "pull-request"
        }
      ]
    })
    tap.end()
  })

  tap.test('Invalid configs', async (tap) => {
    for (const [file, expectedError] of Object.entries(invalidConfigs)) {
      tap.test(file, (tap) => {
        tap.throws(() => {
          wiby.validate({ config: path.join(__dirname, 'fixtures', 'config', file) })
        }, expectedError)
        tap.end()
      })
    }
  })

  tap.test('Valid configs', async (tap) => {
    for (const file of validConfigs) {
      tap.test(file, (tap) => {
        wiby.validate({ config: path.join(__dirname, 'fixtures', 'config', file) })
        tap.end()
      })
    }
  })
})
