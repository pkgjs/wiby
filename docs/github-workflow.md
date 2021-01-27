# wiby github workflow

The `wiby` workflow for Github is very much work in progress, but please ask questions in the issue tracker.

## Installation / Upgrading

This is a manual step, until automation is ready:

1. Install `wiby` as a dev dependency (and update to latest version)
   - having it as a dev dep is not strictly necessary, as the workflow relies on `npx wiby`, but it does give control over the installed version
2. `mkdir -p .github/workflows && npm explore wiby -- cat .github/workflows/wiby.yaml > .github/workflows/wiby.yaml` 
   - Duplicate the default `wiby` workflow - the automation, when developed, will attempt to keep it up to date at that location
3. Make sure your `.github/workflows/wiby.yaml` ends up on the default (`main`, `master`) branch on Github
   - i.e. commit, push, open a PR and merge it, if necessary
4. Add a `WIBY_TOKEN` secret
   - create a new one at https://github.com/settings/tokens, required scopes: `repo:status` and `public_repo`
   - the account has to have _push_ (merge access not necessary) access to the test repositories - you will probably want to fork the dependents into that account (or a separate organization)
   - you may want to use a robot account which _does not have **any** merge access_, as Github does not allow restricting tokens to a subset of repositories
   - the bot account does not need to have access to the original repository (only to the forks used for testing)


## Usage

0. This assumes `.wiby.json` is already configured and that you're an owner or a contributor on the dependency repo
1. Open a PR against the dependency repository
2. Post a comment saying `wiby test` in the PR
   - This should kick off the test workflow and update the `package.json` of configured dependents
   - Shortly after that, a `wiby` status check will have its status set to `pending`
3. Wait a reasonable amount of time for the dependents to finish their tests
4. Post a comment saying `wiby result`
   - Shortly after that, the `wiby` status check will changes its status to report the results of the tests in the dependents (but it may stay pending if they're still running)
