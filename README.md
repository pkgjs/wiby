# wiby

"Will I break you" - a tool for testing dependents

This repository is managed by the [Package Maintenance Working Group](https://github.com/nodejs/package-maintenance), see [Governance](https://github.com/nodejs/package-maintenance/blob/master/Governance.md).

## Pre-requisites

### Github Token

Wiby requires an environment variable `GITHUB_TOKEN` set to a github access token.

Example: `export GITHUB_TOKEN=XXXXX`

For more information on creating a github token see [Github's docs](https://docs.github.com/en/github/authenticating-to-github/creating-a-personal-access-token)

### Running location

Wiby is designed to be run from inside the folder containing your source code.

## Available commands

### test

usage: `wiby test --dependent=URL_TO_DEPENDENT`

Use this command to test your breaking changes against any one of your dependent. Wiby will go off to the dependents repo and create a branch with a patch to the `package.json` pointing to your latest version (with the new changes) triggering the dependents CI to run.

### result

usage: `wiby result --dependent=URL_TO_DEPENDENT`

Use this command to fetch the results of your latest test against a dependent.
