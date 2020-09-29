'use strict'

const tap = require('tap')
const wiby = require('..')

tap.test('Exists', (tap) => {
  wiby.validate({})
  tap.end()
})
