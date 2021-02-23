'use strict'

const tap = require('tap')
const childProcess = require('child_process')
const path = require('path')

const cwd = path.join(__dirname, '..', '..')
const wibyCommand = path.join(cwd, 'bin', 'wiby')

tap.test('validate command', async (tap) => {
  tap.test('should pass on wiby itself', async (tap) => {
    childProcess.execSync(`${wibyCommand} validate`, { cwd: cwd })
    tap.end()
  })
})
