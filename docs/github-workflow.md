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
   - the account has to have push access to the test repositories - you will probably want to fork the dependents into that account (or a separate organization)
   - you may want to use a robot account which _does not have **any** merge access_, as Github does not allow restricting tokens to a subset of repositories
