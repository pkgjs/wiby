'use strict'

const childProcess = require('child_process')
const fs = require('fs')
const path = require('path')
const tap = require('tap')

const gitFixture = require('../fixtures/git')

const wibyCommand = path.join(__dirname, '..', '..', 'bin', 'wiby')

tap.test('github-workflow install command', async (tap) => {
  tap.beforeEach(async () => {
    gitFixture.init()
  })

  tap.test('should copy wiby.yaml to the .github/workflows folder', async (tap) => {
    const workflowsPath = path.join(process.cwd(), '.github', 'workflows')
    const wibyYamlPath = path.join(workflowsPath, 'wiby.yaml')
    const contentsBefore = 'should be overwritten with new version'

    fs.mkdirSync(workflowsPath, { recursive: true })
    fs.writeFileSync(wibyYamlPath, contentsBefore)

    childProcess.execSync(`${wibyCommand} github-workflow install`, {
      env: {
        ...process.env,
        INIT_CWD: ''
      }
    })

    tap.notEqual(fs.readFileSync(wibyYamlPath).toString(), contentsBefore)
  })

  tap.test('should copy wiby.yaml to the $INIT_CWD/.github/workflows folder', async (tap) => {
    const initCwd = path.join(process.cwd(), 'some-other-place')
    const workflowsPath = path.join(initCwd, '.github', 'workflows')
    const wibyYamlPath = path.join(workflowsPath, 'wiby.yaml')
    const contentsBefore = 'should be overwritten with new version'

    fs.mkdirSync(workflowsPath, { recursive: true })
    fs.writeFileSync(wibyYamlPath, contentsBefore)

    childProcess.execSync(`${wibyCommand} github-workflow install`, {
      env: {
        ...process.env,
        INIT_CWD: initCwd
      }
    })

    tap.notEqual(fs.readFileSync(wibyYamlPath).toString(), contentsBefore)
  })

  tap.test('should throw when the workflows path does not exist', async (tap) => {
    try {
      childProcess.execSync(`${wibyCommand} github-workflow install`, {
        env: {
          ...process.env,
          INIT_CWD: ''
        }
      })
      tap.fail('Should fail before reaching here')
    } catch (err) {
      tap.match(err.message, '/.github/workflows folder does not exist.')
    }
  })
})
