'use strict'

const childProcess = require('child_process')
const fs = require('fs')
const path = require('path')
const tap = require('tap')

const gitFixture = require('../fixtures/git')

const wibyCommand = path.join(__dirname, '..', '..', 'bin', 'wiby')

tap.test('github-workflow outdated command', async (tap) => {
  tap.beforeEach(async () => {
    gitFixture.init()
  })

  tap.test('should fail when wiby.yaml is missing', async (tap) => {
    try {
      childProcess.execSync(`${wibyCommand} github-workflow outdated`, {
        env: {
          ...process.env,
          INIT_CWD: ''
        }
      })
      tap.fail('Should fail before reaching here')
    } catch (err) {
      tap.match(err.message, '/.github/workflows/wiby.yaml not found. Use `wiby github-workflow install` to install it.')
    }
  })

  tap.test('should fail when wiby.yaml has the wrong contents', async (tap) => {
    const workflowsPath = path.join(process.cwd(), '.github', 'workflows')
    const wibyYamlPath = path.join(workflowsPath, 'wiby.yaml')
    const contentsBefore = 'should be overwritten with new version'

    fs.mkdirSync(workflowsPath, { recursive: true })
    fs.writeFileSync(wibyYamlPath, contentsBefore)

    try {
      childProcess.execSync(`${wibyCommand} github-workflow outdated`, {
        env: {
          ...process.env,
          INIT_CWD: ''
        }
      })
      tap.fail('Should fail before reaching here')
    } catch (err) {
      tap.match(err.message, '/.github/workflows/wiby.yaml is not the same as the bundled version')
    }
  })

  tap.test('should pass when wiby.yaml has the same contents', async (tap) => {
    const originalContents = fs.readFileSync(path.join(__dirname, '..', '..', '.github', 'workflows', 'wiby.yaml'))
    const workflowsPath = path.join(process.cwd(), '.github', 'workflows')
    const wibyYamlPath = path.join(workflowsPath, 'wiby.yaml')

    fs.mkdirSync(workflowsPath, { recursive: true })
    fs.writeFileSync(wibyYamlPath, originalContents)

    const result = childProcess.execSync(`${wibyCommand} github-workflow outdated`, {
      env: {
        ...process.env,
        INIT_CWD: ''
      }
    }).toString()

    tap.match(result, 'wiby.yaml is the same as the bundled version.')
  })

  tap.test('should pass when wiby.yaml has the same contents in $INIT_CWD', async (tap) => {
    const originalContents = fs.readFileSync(path.join(__dirname, '..', '..', '.github', 'workflows', 'wiby.yaml'))
    const initCwd = path.join(process.cwd(), 'some-other-place')
    const workflowsPath = path.join(initCwd, '.github', 'workflows')
    const wibyYamlPath = path.join(workflowsPath, 'wiby.yaml')

    fs.mkdirSync(workflowsPath, { recursive: true })
    fs.writeFileSync(wibyYamlPath, originalContents)

    const result = childProcess.execSync(`${wibyCommand} github-workflow outdated`, {
      env: {
        ...process.env,
        INIT_CWD: initCwd
      }
    }).toString()

    tap.match(result, 'wiby.yaml is the same as the bundled version.')
  })
})
