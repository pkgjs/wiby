'use strict'

const tap = require('tap')
const childProcess = require('child_process')
const path = require('path')

const gitFixture = require('../fixtures/git')

const wibyCommand = path.join(__dirname, '..', '..', 'bin', 'wiby')
const fixturesPath = path.resolve(path.join(__dirname, '..', 'fixtures'))

tap.test('test command', async (tap) => {
  tap.test('test command should fail when config and dependent provided', async (tap) => {
    gitFixture.init()

    try {
      childProcess.execSync(`${wibyCommand} test --config=.wiby.json --dependent="https://github.com/wiby-test/fakeRepo"`).toString()
      tap.fail()
    } catch (err) {
      tap.equal(true, err.message.includes('Arguments dependent and config are mutually exclusive'))
    }
  })

  tap.test('test command should call test module with dependent URI', async (tap) => {
    gitFixture.init()

    const result = childProcess.execSync(`${wibyCommand} test --dependent="https://github.com/wiby-test/fakeRepo"`, {
      env: {
        ...process.env,
        NODE_OPTIONS: `-r ${fixturesPath}/http/test-command-positive.js`
      }
    }).toString()

    tap.match(result, 'Changes pushed to https://github.com/wiby-test/fakeRepo/blob/wiby-running-unit-tests/package.json')
  })

  tap.test('test command should call test module with all deps from .wiby.json', async (tap) => {
    gitFixture.init()

    const result = childProcess.execSync(`${wibyCommand} test`, {
      env: {
        ...process.env,
        NODE_OPTIONS: `-r ${fixturesPath}/http/test-command-positive.js`
      }
    }).toString()

    tap.match(result, 'Changes pushed to https://github.com/wiby-test/pass/blob/wiby-running-unit-tests/package.json')
    tap.match(result, 'Changes pushed to https://github.com/wiby-test/fail/blob/wiby-running-unit-tests/package.json')
    tap.match(result, 'Changes pushed to https://github.com/wiby-test/partial/blob/wiby-running-unit-tests/package.json')
  })

  tap.test('test command should update existing wiby test branches', async (tap) => {
    gitFixture.init('existing-branch')

    const result = childProcess.execSync(`${wibyCommand} test`, {
      env: {
        ...process.env,
        NODE_OPTIONS: `-r ${fixturesPath}/http/test-command-positive.js`
      }
    }).toString()

    tap.match(result, 'Pushed a new commit to https://github.com/wiby-test/pass#wiby-existing-branch')
    tap.match(result, 'Pushed a new commit to https://github.com/wiby-test/fail#wiby-existing-branch')
    tap.match(result, 'Pushed a new commit to https://github.com/wiby-test/partial#wiby-existing-branch')
  })

  tap.test('test command should not add `wiby-` prefix when branch already has it', async (tap) => {
    gitFixture.init('wiby-running-unit-tests')

    const result = childProcess.execSync(`${wibyCommand} test`, {
      env: {
        ...process.env,
        NODE_OPTIONS: `-r ${fixturesPath}/http/test-command-positive.js`
      }
    }).toString()

    tap.match(result, 'Changes pushed to https://github.com/wiby-test/pass/blob/wiby-running-unit-tests/package.json')
    tap.match(result, 'Changes pushed to https://github.com/wiby-test/fail/blob/wiby-running-unit-tests/package.json')
    tap.match(result, 'Changes pushed to https://github.com/wiby-test/partial/blob/wiby-running-unit-tests/package.json')
  })
})
