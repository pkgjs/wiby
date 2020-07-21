#!/usr/bin/env node

require('dotenv').config()
const test = require('../lib/test')
const result = require('../lib/result')

const args = require('yargs')
  .option('test', {
    alias: 't',
    describe: 'Test your dependents'
  })
  .option('result', {
    alias: 'r',
    describe: 'Get the result of your tests'
  })
  .argv

if (args.test) {
  test(args.test)
}

if (args.result) {
  result()
}

// Usage: wiby --test URL
