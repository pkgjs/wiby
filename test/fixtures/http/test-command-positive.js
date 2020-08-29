/**
 * Mocks of HTTP calls for "wiby test" command positive flow
 */
const nock = require('nock')

nock('https://api.github.com', { allowUnmocked: false })
  // get package json
  .post('/graphql')
  .reply(200, {
    data: {
      repository: {
        object: {
          text: JSON.stringify({
            dependencies: {
              wiby: '*'
            }
          })
        }
      }
    }
  })
  // get commit sha
  .get('/repos/pkgjs/wiby/commits?per_page=1')
  .reply(200, [
    {
      sha: 'fake_sha',
      commit: {
        tree: {
          sha: 'fake_sha'
        }
      }
    }
  ])
  // get dependent commit sha
  .get('/repos/wiby-test/fakeRepo/commits?per_page=1')
  .reply(200, [
    {
      sha: 'fake_sha',
      commit: {
        tree: {
          sha: 'fake_sha'
        }
      }
    }
  ])
  // create blob
  .post('/repos/wiby-test/fakeRepo/git/blobs')
  .reply(200, {
    sha: 'fake_sha'
  })
  // create tree
  .post('/repos/wiby-test/fakeRepo/git/trees')
  .reply(200, {
    sha: 'fake_sha'
  })
  // create commit in dependent
  .post('/repos/wiby-test/fakeRepo/git/commits')
  .reply(200, {
    sha: 'fake_sha'
  })
  // create branch in dependent
  .post('/repos/wiby-test/fakeRepo/git/refs')
  .reply(200, {})
