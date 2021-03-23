'use strict'

const tap = require('tap')
const childProcess = require('child_process')
const path = require('path')

const gitFixture = require('../fixtures/git')

const wibyCommand = path.join(__dirname, '..', '..', 'bin', 'wiby')

tap.test('validate command', async (tap) => {
  tap.beforeEach(async () => {
    gitFixture.init()
  })

  tap.test('should pass on wiby itself', async (tap) => {
    childProcess.execSync(`${wibyCommand} validate`)
    tap.end()
  })
})
