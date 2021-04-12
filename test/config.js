'use strict'

const path = require('path')
const tap = require('tap')

const gitFixture = require('./fixtures/git')

const wiby = require('..')

const invalidConfigs = {
  'fail-bad-json.json': 'Unexpected end of JSON input',
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
          repository: 'https://github.com/wiby-test/partial'
        },
        {
          repository: 'git://github.com/wiby-test/fail'
        },
        {
          repository: 'git+https://github.com/wiby-test/pass'
        }
      ],
      pullRequest: false
    })
    tap.end()
  })

  tap.test('Invalid configs', async (tap) => {
    for (const [file, expectedError] of Object.entries(invalidConfigs)) {
      tap.test(file, (tap) => {
        tap.throws(() => {
          wiby.validate({ config: path.join(__dirname, 'fixtures', 'config', file) })
        }, { message: expectedError })
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
