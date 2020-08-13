const tap = require('tap')
const childProcess = require('child_process')
const path = require('path')

const wibyCommand = path.join(__dirname, '..', 'bin', 'wiby.js')
const cwd = path.join(__dirname, '..')

tap.test('test command', async (tap) => {
  tap.test('test command should require dependent option', async (tap) => {
    try {
      childProcess.execSync(`${wibyCommand} test`, { cwd: cwd }).toString()
      tap.fail()
    } catch (err) {
      tap.equal(true, err.message.indexOf('Missing required argument: dependent') > 0)
    }
  })

  tap.test('test command should call test module with dependent URI', async (tap) => {
    const result = childProcess.execSync(`${wibyCommand} test --dependent="https://github.com/fakeOrg/fakeRepo"`, {
      cwd: cwd,
      env: {
        NODE_OPTIONS: '-r ./test/fixtures/http/test-command-positive.js'
      }
    }).toString()

    tap.equal(true, result.indexOf('Changes pushed to https://github.com/fakeOrg/fakeRepo/blob/wiby-wiby/package.json') > 0)
  })
})

tap.test('result command', async (tap) => {
  tap.test('result command should require dependent option', async (tap) => {
    try {
      childProcess.execSync(`${wibyCommand} result`, { cwd: cwd }).toString()
      tap.fail()
    } catch (err) {
      tap.equal(true, err.message.indexOf('Missing required argument: dependent') > 0)
    }
  })

  tap.test('result command should call result module with dependent URI', async (tap) => {
    const result = childProcess.execSync(`${wibyCommand} result --dependent="https://github.com/fakeOrg/fakeRepo"`, {
      cwd: cwd,
      env: {
        NODE_OPTIONS: '-r ./test/fixtures/http/result-command-positive.js'
      }
    }).toString()

    tap.equal(true, result.indexOf("[ 'fake_run', 'queued' ]") > 0)
    tap.equal(true, result.indexOf("[ 'fake_run_2', 'fake_conclusion' ]") > 0)
  })
})
