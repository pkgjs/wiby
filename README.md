# wiby

"Will I break you" - a tool for testing dependents

This repository is managed by the [Package Maintenance Working Group](https://github.com/nodejs/package-maintenance), see [Governance](https://github.com/nodejs/package-maintenance/blob/master/Governance.md).

## Pre-requisites

### Github Token

wiby requires an environment variable `GITHUB_TOKEN` set to a Github access token. This token needs to be granted push permissions to the dependent repos.

Example: `export GITHUB_TOKEN=XXXXX`

For more information on creating a github token see [Github's docs](https://docs.github.com/en/github/authenticating-to-github/creating-a-personal-access-token)

### Running location

wiby is designed to be run from inside the folder containing your source code. This folder needs to be a git repository with a `package.json` that contains information about the packages source on Github.
Example:

```
{
...
  "repository": {
    "type": "git",
    "url": "https://github.com/ORGNAME/REPONAME.git"
  }
...
}
```

## Available commands

  [wiby test](./USAGE.md#wiby-test)    Test your dependents

  [wiby result](./USAGE.md#wiby-result) Fetch the results of your tests
