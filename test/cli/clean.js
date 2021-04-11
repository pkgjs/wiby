'use strict'

const tap = require('tap')
const childProcess = require('child_process')
const path = require('path')

const gitFixture = require('../fixtures/git')

const wibyCommand = path.join(__dirname, '..', '..', 'bin', 'wiby')
const fixturesPath = path.resolve(path.join(__dirname, '..', 'fixtures'))

tap.test('clean command', async (tap) => {
  tap.beforeEach(async () => {
    gitFixture.init()
  })

  tap.test('should delete test branch in all configured test modules', async (tap) => {
    const result = childProcess.execSync(`${wibyCommand} clean`, {
      env: {
        ...process.env,
        NODE_OPTIONS: `-r ${fixturesPath}/http/clean-command.js`
      }
    }).toString()
    tap.match(result, 'Branches deleted:')
    tap.match(result, '- https://github.com/wiby-test/partial: wiby-running-unit-tests')
    tap.match(result, '- git://github.com/wiby-test/fail: wiby-running-unit-tests')
    tap.match(result, '- git+https://github.com/wiby-test/pass: wiby-running-unit-tests')
  })

  tap.test('should delete test branch in the test module at dependent URI', async (tap) => {
    const result = childProcess.execSync(`${wibyCommand} clean --dependent="https://github.com/wiby-test/fakeRepo"`, {
      env: {
        ...process.env,
        NODE_OPTIONS: `-r ${fixturesPath}/http/clean-command.js`
      }
    }).toString()
    tap.match(result, 'Branches deleted:')
    tap.match(result, '- https://github.com/wiby-test/fakeRepo: wiby-running-unit-tests')
  })

  tap.test('should delete all wiby-* branches in all configured test modules', async (tap) => {
    const result = childProcess.execSync(`${wibyCommand} clean --all`, {
      env: {
        ...process.env,
        NODE_OPTIONS: `-r ${fixturesPath}/http/clean-command-all.js`
      }
    }).toString()
    tap.match(result, 'Branches deleted:')
    tap.match(result, '- https://github.com/wiby-test/partial: wiby-partial-one, wiby-partial-two')
    tap.match(result, '- git://github.com/wiby-test/fail: wiby-fail-one, wiby-fail-two')
    tap.match(result, '- git+https://github.com/wiby-test/pass: wiby-pass-one, wiby-pass-two')
  })

  tap.test('should not delete during dry-run', async (tap) => {
    const result = childProcess.execSync(`${wibyCommand} clean --dry-run`, {
      env: {
        ...process.env,
        NODE_OPTIONS: `-r ${fixturesPath}/http/clean-command-dry.js`
      }
    }).toString()

    tap.match(result, 'Branches to be deleted:')
    tap.match(result, '- https://github.com/wiby-test/partial: wiby-running-unit-tests')
    tap.match(result, '- git://github.com/wiby-test/fail: wiby-running-unit-tests')
    tap.match(result, '- git+https://github.com/wiby-test/pass: wiby-running-unit-tests')
  })
})
