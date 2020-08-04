require('dotenv').config()
const tap = require('tap')
const result = require('../lib/result')
const checks = require('./fixtures/checks')

tap.test('Test correct branch name is returned', async tap => {
  tap.equal(await result.getBranchName('wiby'), 'wiby-wiby')
})

tap.test('Test correct status returned from getResultForEachRun', tap => {
  tap.equal(result.getResultForEachRun(checks).toString(), checks.expected.toString())
  tap.end()
})
