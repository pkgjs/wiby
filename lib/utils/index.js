'use strict'

const ensureGithubToken = () => {
  if (!process.env.GITHUB_TOKEN) {
    throw new Error('GITHUB_TOKEN is required')
  }
}

module.exports = {
  ensureGithubToken
}
