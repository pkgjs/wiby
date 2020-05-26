#!/usr/bin/env node

const test = require('../lib/test')
const result = require('../lib/result')

if (process.argv[2] === 'test') {
  test()
}

if (process.argv[2] === 'result') {
  result()
}
