'use strict'

const tap = require('tap')
const childProcess = require('child_process')
const path = require('path')

const cwd = path.join(__dirname, '..', '..')
const wibyCommand = path.join(cwd, 'bin', 'wiby')
const fixturesPath = path.resolve(path.join(__dirname, '..', 'fixtures'))

tap.test('clean command', async (tap) => {
  tap.test('should delete test branch in all configured test modules', async (tap) => {
    const result = childProcess.execSync(`${wibyCommand} clean`, {
      cwd: cwd,
      env: {
        NODE_OPTIONS: `-r ${fixturesPath}/http/clean-command.js`
      }
    }).toString()
    tap.includes(result, 'Branches deleted:')
    tap.includes(result, '- https://github.com/wiby-test/partial: wiby-wiby')
    tap.includes(result, '- git://github.com/wiby-test/fail: wiby-wiby')
    tap.includes(result, '- git+https://github.com/wiby-test/pass: wiby-wiby')
  })

  tap.test('should delete test branch in the test module at dependent URI', async (tap) => {
    const result = childProcess.execSync(`${wibyCommand} clean --dependent="https://github.com/wiby-test/fakeRepo"`, {
      cwd: cwd,
      env: {
        NODE_OPTIONS: `-r ${fixturesPath}/http/clean-command.js`
      }
    }).toString()
    tap.includes(result, 'Branches deleted:')
    tap.includes(result, '- https://github.com/wiby-test/fakeRepo: wiby-wiby')
  })

  tap.test('should delete all wiby-* branches in all configured test modules', async (tap) => {
    const result = childProcess.execSync(`${wibyCommand} clean --all`, {
      cwd: cwd,
      env: {
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
      cwd: cwd,
      env: {
        NODE_OPTIONS: `-r ${fixturesPath}/http/clean-command-dry.js`
      }
    }).toString()

    tap.includes(result, 'Branches to be deleted:')
    tap.includes(result, '- https://github.com/wiby-test/partial: wiby-wiby')
    tap.includes(result, '- git://github.com/wiby-test/fail: wiby-wiby')
    tap.includes(result, '- git+https://github.com/wiby-test/pass: wiby-wiby')
  })
})
