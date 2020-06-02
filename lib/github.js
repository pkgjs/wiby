const { graphql } = require('@octokit/graphql')
const { Octokit } = require('@octokit/rest')
const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN
})

const graphqlWithAuth = graphql.defaults({
  headers: {
    authorization: `token ${process.env.GITHUB_TOKEN}`
  }
})

module.exports.getPackageJson =
async function getPackageJson (owner, repo) {
  try {
    const resp = await graphqlWithAuth({
      query: `query($owner: String!, $repo: String!) {
        repository(name: $repo, owner: $owner) {
          object(expression: "master:package.json") {
            ... on Blob {
              text
            }
          }
        }
      }`,
      owner: owner,
      repo: repo
    })
    return (JSON.parse(resp.repository.object.text))
  } catch (err) {
    if (err.errors && err.errors[0].type === 'NOT_FOUND') {
      throw Error(`Could not find GitHub repository at https://www.github.com/${owner}/${repo}`)
    } else {
      throw err
    }
  }
}

module.exports.getPermissions =
async function getPermissions (owner, repo) {
  try {
    const resp = await graphqlWithAuth({
      query: `query($owner: String!, $repo: String!) {
        repository(name: $repo, owner: $owner) {
          viewerPermission
        }
      }`,
      owner: owner,
      repo: repo
    })
    return resp.repository.viewerPermission
  } catch (err) {
    if (err.errors && err.errors[0].type === 'NOT_FOUND') {
      throw Error(`Could not find GitHub repository at https://www.github.com/${owner}/${repo}`)
    } else {
      throw err
    }
  }
}

module.exports.getShas =
async function getShas (owner, repo) {
  const resp = await octokit.repos.listCommits({
    owner,
    repo,
    per_page: 1
  })
  const headSha = resp.data[0].sha
  const treeSha = resp.data[0].commit.tree.sha
  // console.log(`lastSha: ${headSha} treeSha: ${treeSha}`)
  return [headSha, treeSha]
}

module.exports.createBlob =
async function createBlob (owner, repo, file) {
  const {
    data: { sha: blobSha }
  } = await octokit.git.createBlob({
    owner,
    repo,
    content: file,
    encoding: 'base64'
  })
  return blobSha
}

module.exports.createTree = async function createTree (owner, repo, treeSha, blobSha) {
  const resp = await octokit.git.createTree({
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
  const newTreeSha = resp.data.sha
  return newTreeSha
}

module.exports.createCommit =
async function createCommit (owner, repo, message, newTreeSha, headSha) {
  const resp = await octokit.git.createCommit({
    owner,
    repo,
    message: message,
    tree: newTreeSha,
    parents: [headSha]
  })
  const commitSha = resp.data.sha
  return commitSha
}

module.exports.createBranch =
async function createBranch (owner, repo, commitSha, branch) {
  await octokit.git.createRef({
    owner,
    repo,
    sha: commitSha,
    ref: `refs/heads/${branch}`
  })
}
