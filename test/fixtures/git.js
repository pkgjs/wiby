'use strict'

const childProcess = require('child_process')
const fs = require('fs')
const path = require('path')
const tmp = require('tmp')

exports.TEST_BRANCH_NAME = 'running-unit-tests'

exports.init = function () {
  const gitRepoPath = path.join(__dirname, '..', '..')

  const { name: tmpDir } = tmp.dirSync()
  process.chdir(tmpDir)

  childProcess.execSync('git init --initial-branch=running-unit-tests')
  childProcess.execSync('git config user.email "wiby@example.com"')
  childProcess.execSync('git config user.name "Wiby Bot"')

  for (const fn of ['package.json', '.wiby.json']) {
    fs.copyFileSync(path.join(gitRepoPath, fn), path.join(tmpDir, fn))
  }

  childProcess.execSync('git add .')
  childProcess.execSync('git commit -m "test" --no-gpg-sign --no-verify')

  return tmpDir
}
