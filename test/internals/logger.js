'use strict'

const tap = require('tap')
const logger = require('../../lib/logger')

tap.test('logger module', async (tap) => {
  tap.test('logger should have default params', async (tap) => {
    const debug = logger()

    tap.equals('wiby:general', debug.namespace)
    // check that output stream changed by default by overriding "log" method
    tap.equals(true, Object.prototype.hasOwnProperty.call(debug, 'log'))
  })

  tap.test('logger should assign passed namespace', async (tap) => {
    const debug = logger('wiby:unit-test')

    tap.equals('wiby:unit-test', debug.namespace)
  })

  tap.test('logger should not change default output stream in case writeToStdOut = false', async (tap) => {
    const debug = logger('wiby:unit-test', false)

    tap.equals('wiby:unit-test', debug.namespace)
    // check that default output stream not changed
    tap.equals(false, Object.prototype.hasOwnProperty.call(debug, 'log'))
  })

  tap.test('module should have enableLogs() with default params', async (tap) => {
    const debug = logger()
    logger.enableLogs()

    tap.equals(true, debug.enabled)
  })
})
