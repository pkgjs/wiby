'use strict'

const debugPkg = require('debug')

/**
 * Factory function for 'debug' package.
 *
 * Accepts namespace for setting up 'debug'. Writes to stdout by default.
 * In case stderr required - pass writeToStdOut = false.
 *
 * Retuns debug log function
 */
module.exports = function debug (namespace = 'wiby:general', writeToStdOut = true) {
  const logger = debugPkg(namespace)

  if (writeToStdOut) {
    logger.log = console.log.bind(console)
  }

  return logger
}

/**
 * Enables 'debug' logs for specified namespace
 */
module.exports.enableLogs = function enableLogs (namespace = 'wiby:*') {
  debugPkg.enable(namespace)
}
