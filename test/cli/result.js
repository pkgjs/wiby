'use strict'

const tap = require('tap')
const childProcess = require('child_process')
const path = require('path')
const fs = require('fs')

const cwd = path.join(__dirname, '..', '..')
const wibyCommand = path.join(cwd, 'bin', 'wiby')
const fixturesPath = path.resolve(path.join(__dirname, '..', 'fixtures'))

const PENDING_RESULT_EXIT_CODE = 64

tap.test('result command', async (tap) => {
  tap.test('result command should fail when config and dependent provided', async (tap) => {
    try {
      childProcess.execSync(`${wibyCommand} result --config=.wiby.json --dependent="https://github.com/wiby-test/fakeRepo"`, { cwd: cwd }).toString()
      tap.fail()
    } catch (err) {
      tap.equal(true, err.message.includes('Arguments dependent and config are mutually exclusive'))
    }
  })

  tap.test('result command should call result module with dependent URI', async (tap) => {
    const expected = fs.readFileSync(
      path.join(__dirname, '..', 'fixtures', 'expected-outputs', 'result', 'result-output-single-dependant.md'),
      'utf-8'
    )
      .trim()

    try {
      childProcess.execSync(`${wibyCommand} result --dependent="https://github.com/wiby-test/fakeRepo"`, {
        cwd: cwd,
        env: {
          ...process.env,
          NODE_OPTIONS: `-r ${fixturesPath}/http/result-command-positive.js`
        }
      })
    } catch (e) {
      const result = e.output[1].toString().trim()

      tap.equal(result, expected)
      tap.equal(e.status, PENDING_RESULT_EXIT_CODE)
    }
  })

  tap.test('result command should call result module with all deps from .wiby.json', async (tap) => {
    const expected = fs.readFileSync(
      path.join(__dirname, '..', 'fixtures', 'expected-outputs', 'result', 'result-output-multiple-dependant.md'),
      'utf-8'
    )
      .trim()

    try {
      childProcess.execSync(`${wibyCommand} result`, {
        cwd: cwd,
        env: {
          ...process.env,
          NODE_OPTIONS: `-r ${fixturesPath}/http/result-command-positive.js`
        }
      })
    } catch (e) {
      const result = e.output[1].toString().trim()

      tap.equal(result, expected)
      tap.equal(e.status, PENDING_RESULT_EXIT_CODE)
    }
  })

  tap.test('result command handles empty response from github.getChecks()', tap => {
    const expected = fs.readFileSync(
      path.join(__dirname, '..', 'fixtures', 'expected-outputs', 'result', 'result-output-single-dependant.md'),
      'utf-8'
    )
      .trim()

    try {
      childProcess.execSync(`${wibyCommand} result --dependent="https://github.com/wiby-test/fakeRepo"`, {
        cwd: cwd,
        env: {
          ...process.env,
          NODE_OPTIONS: `-r ${fixturesPath}/http/result-command-empty-branch-checks.js`
        }
      })
    } catch (e) {
      const result = e.output[1].toString().trim()

      tap.equal(result, expected)
      tap.equal(e.status, PENDING_RESULT_EXIT_CODE)
    }

    tap.end()
  })

  tap.test('result command should exit with code 1 for overall failed status', async (tap) => {
    const expected = fs.readFileSync(
      path.join(__dirname, '..', 'fixtures', 'expected-outputs', 'result', 'result-output-single-dependant-check-failed.md'),
      'utf-8'
    )
      .trim()

    try {
      childProcess.execSync(`${wibyCommand} result --dependent="https://github.com/wiby-test/fakeRepo"`, {
        cwd: cwd,
        env: {
          ...process.env,
          NODE_OPTIONS: `-r ${fixturesPath}/http/result-command-positive-checks-failed.js`
        }
      })
    } catch (e) {
      const result = e.output[1].toString().trim()

      tap.equal(result, expected)
      tap.equal(e.status, 1)
    }
  })
})
