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
    tap.includes(result, 'Branches deleted:')
    tap.includes(result, '- https://github.com/wiby-test/partial: wiby-branch-naming')
    tap.includes(result, '- git://github.com/wiby-test/fail: wiby-branch-naming')
    tap.includes(result, '- git+https://github.com/wiby-test/pass: wiby-branch-naming')
  })

  tap.test('should delete test branch in the test module at dependent URI', async (tap) => {
    const result = childProcess.execSync(`${wibyCommand} clean --dependent="https://github.com/wiby-test/fakeRepo"`, {
      env: {
        ...process.env,
        NODE_OPTIONS: `-r ${fixturesPath}/http/clean-command.js`
      }
    }).toString()
    tap.includes(result, 'Branches deleted:')
    tap.includes(result, '- https://github.com/wiby-test/fakeRepo: wiby-branch-naming')
  })

  tap.test('should delete all wiby-* branches in all configured test modules', async (tap) => {
    const result = childProcess.execSync(`${wibyCommand} clean --all`, {
      env: {
        ...process.env,
        NODE_OPTIONS: `-r ${fixturesPath}/http/clean-command-all.js`
      }
    }).toString()
    tap.includes(result, 'Branches deleted:')
    tap.includes(result, '- https://github.com/wiby-test/partial: wiby-partial-one, wiby-partial-two')
    tap.includes(result, '- git://github.com/wiby-test/fail: wiby-fail-one, wiby-fail-two')
    tap.includes(result, '- git+https://github.com/wiby-test/pass: wiby-pass-one, wiby-pass-two')
  })

  tap.test('should not delete during dry-run', async (tap) => {
    const result = childProcess.execSync(`${wibyCommand} clean --dry-run`, {
      env: {
        ...process.env,
        NODE_OPTIONS: `-r ${fixturesPath}/http/clean-command-dry.js`
      }
    }).toString()

    tap.includes(result, 'Branches to be deleted:')
    tap.includes(result, '- https://github.com/wiby-test/partial: wiby-branch-naming')
    tap.includes(result, '- git://github.com/wiby-test/fail: wiby-branch-naming')
    tap.includes(result, '- git+https://github.com/wiby-test/pass: wiby-branch-naming')
  })
})
