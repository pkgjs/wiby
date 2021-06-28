'use strict'

const { graphql } = require('@octokit/graphql')
const { Octokit } = require('@octokit/rest')

const queries = require('./graphql')

const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN
})

const graphqlWithAuth = graphql.defaults({
  headers: {
    authorization: `token ${process.env.GITHUB_TOKEN}`
  }
})

module.exports.getPackageJson = async function getPackageJson (owner, repo) {
  try {
    const resp = await graphqlWithAuth({
      query: queries.getPackageJson,
      owner: owner,
      repo: repo
    })
    return (JSON.parse(resp.repository.object.text))
  } catch (err) {
    if (err.status === 404) {
      throw Error(`Could not find GitHub repository at https://www.github.com/${owner}/${repo}`)
    } else {
      throw err
    }
  }
}

module.exports.getWibyBranches = async function (owner, repo) {
  const resp = await graphqlWithAuth({
    query: queries.getWibyBranches,
    owner: owner,
    repo: repo
  })
  const edges = resp.organization.repository.refs.edges
  return edges.map(({ node: { branchName } }) => branchName)
}

module.exports.getDefaultBranch = async function (owner, repo) {
  const resp = await graphqlWithAuth({
    query: queries.getDefaultBranch,
    owner: owner,
    repo: repo
  })
  return resp.repository.defaultBranchRef.name
}

module.exports.getShas = async function getShas (owner, repo) {
  const resp = await octokit.repos.listCommits({
    owner,
    repo,
    per_page: 1
  })
  const headSha = resp.data[0].sha
  const treeSha = resp.data[0].commit.tree.sha
  return [headSha, treeSha]
}

module.exports.createBlob = async function createBlob (owner, repo, file) {
  const { data: { sha: blobSha } } = await octokit.git.createBlob({
    owner,
    repo,
    content: file,
    encoding: 'base64'
  })
  return blobSha
}

module.exports.createTree = async function createTree (owner, repo, treeSha, blobSha) {
  const { data: { sha: newTreeSha } } = await octokit.git.createTree({
    owner,
    repo,
    base_tree: treeSha,
    tree: [
      { path: 'package.json', mode: '100644', sha: blobSha }
    ],
    headers: {
      Accept: 'application/json'
    }
  })
  return newTreeSha
}

module.exports.createCommit = async function createCommit (owner, repo, message, newTreeSha, headSha) {
  const { data: { sha: commitSha } } = await octokit.git.createCommit({
    owner,
    repo,
    message: message,
    tree: newTreeSha,
    parents: [headSha]
  })
  return commitSha
}

module.exports.createBranch = async function createBranch (owner, repo, commitSha, branch) {
  await octokit.git.createRef({
    owner,
    repo,
    sha: commitSha,
    ref: `refs/heads/${branch}`
  })
}

module.exports.deleteBranch = async function deleteBranch (owner, repo, branch) {
  await octokit.git.deleteRef({
    owner,
    repo,
    ref: `heads/${branch}`
  })
}

module.exports.getBranch = async function getBranch (owner, repo, branch) {
  try {
    return await octokit.repos.getBranch({
      owner,
      repo,
      branch
    })
  } catch (err) {
    if (err.status === 404) {
      return undefined
    }
    throw err
  }
}

module.exports.getChecks = async function getChecks (owner, repo, branch) {
  return octokit.checks.listForRef({
    owner,
    repo,
    ref: branch
  })
}

module.exports.getCommitStatusesForRef = async function getCommitStatusesForRef (owner, repo, branch) {
  return octokit.repos.listCommitStatusesForRef({
    owner,
    repo,
    ref: branch
  })
}

module.exports.createPR = async function createPR (owner, repo, title, head, base, draft, body) {
  return octokit.pulls.create({
    owner,
    repo,
    title,
    head,
    base,
    draft,
    body
  })
}

module.exports.closePR = async function closePR (owner, repo, pullNumber) {
  return octokit.rest.pulls.update({
    owner,
    repo,
    pull_number: pullNumber,
    state: 'closed'
  })
}
