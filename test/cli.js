'use strict'

const tap = require('tap')
const childProcess = require('child_process')
const path = require('path')
const fs = require('fs')

const wibyCommand = path.join(__dirname, '..', 'bin', 'wiby')
const cwd = path.join(__dirname, '..')

const PENDING_RESULT_EXIT_CODE = 64

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
        NODE_OPTIONS: '-r ./test/fixtures/http/test-command-positive.js'
      }
    }).toString()

    tap.includes(result, 'Changes pushed to https://github.com/wiby-test/fakeRepo/blob/wiby-wiby/package.json')
  })

  tap.test('test command should call test module with all deps from .wiby.json', async (tap) => {
    const result = childProcess.execSync(`${wibyCommand} test`, {
      cwd: cwd,
      env: {
        NODE_OPTIONS: '-r ./test/fixtures/http/test-command-positive.js'
      }
    }).toString()

    tap.includes(result, 'Changes pushed to https://github.com/wiby-test/pass/blob/wiby-wiby/package.json')
    tap.includes(result, 'Changes pushed to https://github.com/wiby-test/fail/blob/wiby-wiby/package.json')
    tap.includes(result, 'Changes pushed to https://github.com/wiby-test/partial/blob/wiby-wiby/package.json')
  })
})

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
      path.join(__dirname, '.', 'fixtures', 'expected-outputs', 'result', 'result-output-single-dependant.md'),
      'utf-8'
    )
      .trim()

    try {
      childProcess.execSync(`${wibyCommand} result --dependent="https://github.com/wiby-test/fakeRepo"`, {
        cwd: cwd,
        env: {
          NODE_OPTIONS: '-r ./test/fixtures/http/result-command-positive.js'
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
      path.join(__dirname, '.', 'fixtures', 'expected-outputs', 'result', 'result-output-multiple-dependant.md'),
      'utf-8'
    )
      .trim()

    try {
      childProcess.execSync(`${wibyCommand} result`, {
        cwd: cwd,
        env: {
          NODE_OPTIONS: '-r ./test/fixtures/http/result-command-positive.js'
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
      path.join(__dirname, '.', 'fixtures', 'expected-outputs', 'result', 'result-output-single-dependant.md'),
      'utf-8'
    )
      .trim()

    try {
      childProcess.execSync(`${wibyCommand} result --dependent="https://github.com/wiby-test/fakeRepo"`, {
        cwd: cwd,
        env: {
          NODE_OPTIONS: '-r ./test/fixtures/http/result-command-empty-branch-checks.js'
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
      path.join(__dirname, '.', 'fixtures', 'expected-outputs', 'result', 'result-output-single-dependant-check-failed.md'),
      'utf-8'
    )
      .trim()

    try {
      childProcess.execSync(`${wibyCommand} result --dependent="https://github.com/wiby-test/fakeRepo"`, {
        cwd: cwd,
        env: {
          NODE_OPTIONS: '-r ./test/fixtures/http/result-command-positive-checks-failed.js'
        }
      })
    } catch (e) {
      const result = e.output[1].toString().trim()

      tap.equal(result, expected)
      tap.equal(e.status, 1)
    }
  })
})

tap.test('validate command', async (tap) => {
  tap.test('should pass on wiby itself', async (tap) => {
    childProcess.execSync(`${wibyCommand} validate`, { cwd: cwd })
    tap.end()
  })
})

tap.test('clean command', async (tap) => {
  tap.test('should delete test branch in all configured test modules', async (tap) => {
    const result = childProcess.execSync(`${wibyCommand} clean`, {
      cwd: cwd,
      env: {
        NODE_OPTIONS: '-r ./test/fixtures/http/clean-command.js'
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
        NODE_OPTIONS: '-r ./test/fixtures/http/clean-command.js'
      }
    }).toString()

    tap.includes(result, 'Branches deleted:')
    tap.includes(result, '- https://github.com/wiby-test/fakeRepo: wiby-wiby')
  })

  tap.test('should delete all wiby-* branches in all configured test modules', async (tap) => {
    const result = childProcess.execSync(`${wibyCommand} clean --all`, {
      cwd: cwd,
      env: {
        NODE_OPTIONS: '-r ./test/fixtures/http/clean-command.js'
      }
    }).toString()

    tap.includes(result, 'Branches deleted:')
    tap.includes(result, '- https://github.com/wiby-test/partial: wiby-partial-one, wiby-partial-two')
    tap.includes(result, '- git://github.com/wiby-test/fail: wiby-fail-one, wiby-fail-two')
    tap.includes(result, '- git+https://github.com/wiby-test/pass: wiby-pass-one, wiby-pass-two')
  })
})
