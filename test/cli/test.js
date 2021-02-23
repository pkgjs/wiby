'use strict'

const tap = require('tap')
const childProcess = require('child_process')
const path = require('path')

const cwd = path.join(__dirname, '..', '..')
const wibyCommand = path.join(cwd, 'bin', 'wiby')
const fixturesPath = path.resolve(path.join(__dirname, '..', 'fixtures'))

tap.test('test command', async (tap) => {
  tap.test('test command should fail when config and dependent provided', async (tap) => {
    try {
      childProcess.execSync(`${wibyCommand} test --config=.wiby.json --dependent="https://github.com/wiby-test/fakeRepo"`, { cwd: cwd }).toString()
      tap.fail()
    } catch (err) {
      tap.equal(true, err.message.includes('Arguments dependent and config are mutually exclusive'))
    }
  })

  tap.test('test command should call test module with dependent URI', async (tap) => {
    const result = childProcess.execSync(`${wibyCommand} test --dependent="https://github.com/wiby-test/fakeRepo"`, {
      cwd: cwd,
      env: {
        NODE_OPTIONS: `-r ${fixturesPath}/http/test-command-positive.js`
      }
    }).toString()

    tap.includes(result, 'Changes pushed to https://github.com/wiby-test/fakeRepo/blob/wiby-wiby/package.json')
  })

  tap.test('test command should call test module with all deps from .wiby.json', async (tap) => {
    const result = childProcess.execSync(`${wibyCommand} test`, {
      cwd: cwd,
      env: {
        NODE_OPTIONS: `-r ${fixturesPath}/http/test-command-positive.js`
      }
    }).toString()

    tap.includes(result, 'Changes pushed to https://github.com/wiby-test/pass/blob/wiby-wiby/package.json')
    tap.includes(result, 'Changes pushed to https://github.com/wiby-test/fail/blob/wiby-wiby/package.json')
    tap.includes(result, 'Changes pushed to https://github.com/wiby-test/partial/blob/wiby-wiby/package.json')
  })
})
