const tap = require('tap')
const childProcess = require('child_process')
const path = require('path')

const wibyCommand = path.join(__dirname, '..', 'bin', 'wiby')
const cwd = path.join(__dirname, '..')

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

    tap.equal(true, result.includes('Changes pushed to https://github.com/wiby-test/fakeRepo/blob/wiby-wiby/package.json'))
  })

  tap.test('test command should call test module with all deps from .wiby.json', async (tap) => {
    const result = childProcess.execSync(`${wibyCommand} test`, {
      cwd: cwd,
      env: {
        NODE_OPTIONS: '-r ./test/fixtures/http/test-command-positive.js'
      }
    }).toString()

    tap.equal(true, result.includes('Changes pushed to https://github.com/wiby-test/pass/blob/wiby-wiby/package.json'))
    tap.equal(true, result.includes('Changes pushed to https://github.com/wiby-test/fail/blob/wiby-wiby/package.json'))
    tap.equal(true, result.includes('Changes pushed to https://github.com/wiby-test/partial/blob/wiby-wiby/package.json'))
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
    const result = childProcess.execSync(`${wibyCommand} result --dependent="https://github.com/wiby-test/fakeRepo"`, {
      cwd: cwd,
      env: {
        NODE_OPTIONS: '-r ./test/fixtures/http/result-command-positive.js'
      }
    }).toString()

    tap.equal(true, result.includes("[ 'fake_run', 'queued' ]"))
    tap.equal(true, result.includes("[ 'fake_run_2', 'fake_conclusion' ]"))
  })

  tap.test('test command should call test module with all deps from .wiby.json', async (tap) => {
    const result = childProcess.execSync(`${wibyCommand} result`, {
      cwd: cwd,
      env: {
        NODE_OPTIONS: '-r ./test/fixtures/http/result-command-positive.js'
      }
    }).toString()

    tap.equal(true, result.includes("[ 'fail_run', 'queued' ]"))
    tap.equal(true, result.includes("[ 'fail_run_2', 'fake_conclusion' ]"))

    tap.equal(true, result.includes("[ 'pass_run', 'queued' ]"))
    tap.equal(true, result.includes("[ 'pass_run_2', 'fake_conclusion' ]"))

    tap.equal(true, result.includes("[ 'partial_run', 'queued' ]"))
    tap.equal(true, result.includes("[ 'partial_run_2', 'fake_conclusion' ]"))
  })

  tap.test('result command handles empty response from github.getChecks()', tap => {
    const result = childProcess.execSync(`${wibyCommand} result --dependent="https://github.com/wiby-test/fakeRepo"`, {
      cwd: cwd,
      env: {
        NODE_OPTIONS: '-r ./test/fixtures/http/result-command-empty-branch-checks.js'
      }
    }).toString()

    tap.equal(true, result.includes("[ 'fake_run', 'queued' ]"))
    tap.equal(true, result.includes("[ 'fake_run_2', 'fake_conclusion' ]"))
    tap.end()
  })
})

tap.test('validate command', async (tap) => {
  tap.test('should pass on wiby itself', async (tap) => {
    const result = childProcess.execSync(`${wibyCommand} validate`, { cwd: cwd }).toString()
    console.info(result)
    tap.end()
  })
})
