# wiby
"Will I break you" - a tool for testing dependents

# Flow

1. Define the list of dependents you want to test against in a `wiby.json`.
1. Push the release candidate branch or tag to GitHub.
   - `wiby` would also be able to run on a specific commit.
1. Indicate that you want to start your dependent tests by running `wiby test` locally while on your release candidate branch.
1. By default, `wiby` will look for your defined list of dependents to test against in `wiby.json`.
   - You can supply a path to `wiby.json` with `--file`.
1. For each module in the `wiby.json`, retrieve their `package.json` and determine whether the module is likely to automatically be updated to the new version of your module once it is released.
    - If the `--force` option is supplied then we will ignore this check.
    - For example, if you're creating a release candidate for `v2.1.0-rc`, and the dependent module is using the range `^1.x.x`, then we should not open a test PR.
1. Patch the `package.json` of the dependent module to point to the release candidate branch for your module.
1. Run either `npm update` or `yarn upgrade`.
1. Open a draft PR in the dependents repository that contains the patched `package.json`.
1. `wiby` will create a JSON file (`wiby-v2.1.0.json`) which contains the links of dependent PRs that have been opened.
1. `wiby result` will loop through the run file (`wiby-v2.1.0.json`) and interact with the GitHub Checks API to determine whether the tests have passed.
   - `wiby result` is a separate command as it is expected that tests will take some time to complete.