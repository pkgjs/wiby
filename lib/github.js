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

module.exports.getDefaultBranch = async function getDefaultBranch (owner, repo) {
  try {
    const resp = await graphqlWithAuth({
      query: `query ($owner: String!, $repo: String!) {
        repository(name: $repo, owner: $owner) {
          defaultBranchRef {
            name
        }
      }
    }`,
      owner: owner,
      repo: repo
    })
    if (resp && resp.repository && resp.repository.defaultBranchRef) {
      return resp.repository.defaultBranchRef.name
    }
    /* I'm not sure I want to return a string if the query does not
    produce the json expected however I want to resolve this during
    the review stage as changing this and throwing impacts other tests
     */
    return 'master'
  } catch (err) {
    if (err.errors && err.errors[0].type === 'NOT_FOUND') {
      throw Error(`Could not find GitHub repository at https://www.github.com/${owner}/${repo}`)
    } else {
      throw err
    }
  }
}

module.exports.getPackageJson = async function getPackageJson (owner, repo, defaultBranch) {
  try {
    const resp = await graphqlWithAuth({
      query: `query($owner: String!, $repo: String!) {
        repository(name: $repo, owner: $owner) {
          object(expression: "${defaultBranch}:package.json") {
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

module.exports.getPermissions = async function getPermissions (owner, repo) {
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
    if (resp && resp.repository) {
      return resp.repository.viewerPermission
    }
    throw Error(`Poorly formed repository data at https://www.github.com/${owner}/${repo}`)
  } catch (err) {
    if (err.errors && err.errors[0].type === 'NOT_FOUND') {
      throw Error(`Could not find GitHub repository at https://www.github.com/${owner}/${repo}`)
    } else {
      throw err
    }
  }
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
