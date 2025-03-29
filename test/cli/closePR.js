'use strict'
const tap = require('tap')
const gitFixture = require('../fixtures/git')
const childProcess = require('child_process')
const nock = require('nock')
const path = require('path')

const wibyCommand = path.join(__dirname, '..', '..', 'bin', 'wiby')
const fixturesPath = path.resolve(path.join(__dirname, '..', 'fixtures'))

tap.test('closePRs command', async (t) => {
  t.beforeEach(async () => {
    process.env.GITHUB_TOKEN = 'ghp_123_abc'
    nock.disableNetConnect()
    gitFixture.init()
  })

  tap.test('close-pr command should fail when github token is not set', async (tap) => {
    process.env.GITHUB_TOKEN = ''
    gitFixture.init()

    try {
      childProcess.execSync(`${wibyCommand} close-pr`).toString()
      tap.fail()
    } catch (err) {
      tap.equal(true, err.message.includes('GITHUB_TOKEN is required'))
    }
  })

  t.test('close-pr should fail if config and dependent provided', async (t) => {
    try {
      childProcess.execSync(`${wibyCommand} close-pr --config=.wiby.json --dependent="https://github.com/wiby-test/fakeRepo"`)
      tap.fail()
    } catch (err) {
      tap.equal(true, err.message.includes('Arguments dependent and config are mutually exclusive'))
    }
  })
  t.test('close-pr should call and close the PR on command with dependent argument', async (t) => {
    const result = childProcess.execSync(`${wibyCommand} close-pr --dependent="https://github.com/wiby-test/fakeRepo"`, {
      env: {
        ...process.env,
        NODE_OPTIONS: `-r ${fixturesPath}/http/close-pr-command-positive.js`
      }
    }).toString()
    t.match(result, '1 PRs closed\n')
  })
  t.test('close-pr should call and close the PR on command using wiby.json settings', async (t) => {
    const result = childProcess.execSync(`${wibyCommand} close-pr`, {
      env: {
        ...process.env,
        NODE_OPTIONS: `-r ${fixturesPath}/http/close-pr-command-positive.js`
      }
    }).toString()
    t.match(result, '1 PRs closed\n')
  })
})
