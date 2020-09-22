# Usage
  

## `wiby result`



Use this command to fetch the results of your latest test against a dependent.
Wiby will go off to the dependent's repo and fetch the results of the CI run
against the patch branch Wiby had created.

```
Options:
  --version    Show version number                                     [boolean]
  --help       Show help                                               [boolean]
  --dependent  URL of a dependent                            [string] [required]
```


## `wiby test`



Use this command to test your breaking changes against any one of your
dependents. Wiby will go off to the dependent's repo and create a branch with a
patch to the  `package.json` pointing to your latest version (with the new
changes) triggering the dependents CI to run.

```
Options:
  --version    Show version number                                     [boolean]
  --help       Show help                                               [boolean]
  --dependent  URL of a dependent                            [string] [required]
```

