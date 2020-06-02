module.exports.DEP_URL = 'https://github.com/andrewhughes101/do-you-pass'
module.exports.PKGJSON = {
  name: 'do-you-pass',
  version: '1.0.0',
  description: 'Does i-should-pass pass?',
  main: 'index.js',
  scripts: {
    test: 'node test.js'
  },
  author: 'Andrew Hughes',
  license: 'Apache-2.0',
  homepage: 'https://github.com/andrewhughes101/do-you-pass',
  repository: {
    type: 'git',
    url: 'https://github.com/andrewhughes101/do-you-pass.git'
  },
  dependencies: {
    'i-should-pass': '^1.0.0'
  }
}
module.exports.PATCHED_PKGJSON = {
  name: 'do-you-pass',
  version: '1.0.0',
  description: 'Does i-should-pass pass?',
  main: 'index.js',
  scripts: {
    test: 'node test.js'
  },
  author: 'Andrew Hughes',
  license: 'Apache-2.0',
  homepage: 'https://github.com/andrewhughes101/do-you-pass',
  repository: {
    type: 'git',
    url: 'https://github.com/andrewhughes101/do-you-pass.git'
  },
  dependencies: {
    'i-should-pass': 'andrewhughes101/i-should-pass#ec218ed4d7bd085c4aa3d94c2f86a43470754816'
  }
}
module.exports.PATCH = 'andrewhughes101/i-should-pass#ec218ed4d7bd085c4aa3d94c2f86a43470754816'
module.exports.PKG_NAME = 'i-should-pass'
module.exports.PKG_REPO = 'i-should-pass'
module.exports.PKG_ORG = 'andrewhughes101'
module.exports.DEP_REPO = 'do-you-pass'
module.exports.DEP_ORG = 'andrewhughes101'
module.exports.PKG_HEAD_SHA = 'ec218ed4d7bd085c4aa3d94c2f86a43470754816'
module.exports.LOCAL = 'i-should-pass'
module.exports.DEP_REPO_PERM = 'ADMIN'
