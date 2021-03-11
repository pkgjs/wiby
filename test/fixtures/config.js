'use strict'

module.exports.PKGJSON = require('./pass/package.json')
module.exports.PATCHED_PKGJSON = Object.assign({}, module.exports.PKGJSON, {
  dependencies: Object.assign(
    {},
    module.exports.PKGJSON.dependencies,
    { '@pkgjs/wiby': 'pkgjs/wiby#577c08e8fd5e1b3156ce75b2e5d9e3023dac180e' }
  )
})

module.exports.PKGJSON_DEV_DEPS = Object.assign({}, module.exports.PKGJSON, {
  devDependencies: {
    '@other/name': '*'
  }
})
module.exports.PATCHED_DEV_DEPS_PKGJSON = Object.assign({}, module.exports.PKGJSON, {
  devDependencies:
    { '@other/name': 'other/name#577c08e8fd5e1b3156ce75b2e5d9e3023dac180e' }
})

module.exports.PKGJSON_PEER_DEPS = Object.assign({}, module.exports.PKGJSON, {
  peerDependencies: {
    '@other/plugin': '*'
  }
})
module.exports.PATCHED_PEER_DEPS_PKGJSON = Object.assign({}, module.exports.PKGJSON, {
  peerDependencies:
    { '@other/plugin': 'other/plugin#577c08e8fd5e1b3156ce75b2e5d9e3023dac180e' }
})
module.exports.PATCH = 'pkgjs/wiby#577c08e8fd5e1b3156ce75b2e5d9e3023dac180e'
module.exports.DEV_DEP_PATCH = 'other/name#577c08e8fd5e1b3156ce75b2e5d9e3023dac180e'
module.exports.PEER_DEP_PATCH = 'other/plugin#577c08e8fd5e1b3156ce75b2e5d9e3023dac180e'
module.exports.PKG_NAME_UNIT = '@pkgjs/wiby'
module.exports.PKG_NAME_INTEGRATION = 'wiby'
module.exports.PKG_REPO = 'wiby'
module.exports.PKG_ORG = 'pkgjs'
module.exports.PKG_HEAD_SHA = '577c08e8fd5e1b3156ce75b2e5d9e3023dac180e'
module.exports.DEP_REPO = 'pass'
module.exports.DEP_ORG = 'wiby-test'
module.exports.DEP_REPO_PERM = 'ADMIN'
module.exports.DEV_DEP_PKG_NAME_UNIT = '@other/name'
module.exports.DEV_PEER_PKG_NAME_UNIT = '@other/plugin'
