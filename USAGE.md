# Usage
  

## `wiby clean`



Use this command to clean up branches created by wiby (i.e. branches with the
"wiby-" prefix).

```
Options:

  --dependent  URL of a dependent                                       [string]
  --config     Path to the configuration file. By default it will try to load
               the configuration from the first file it finds in the current
               working directory: `.wiby.json`, `.wiby.js`              [string]
  --all        Remove all branches with "wiby-" prefix. By default, `wiby clean`
               will only remove the branch that would be created if `wiby test`
               ran in the current repository, on the current branch.
  --dry-run    Print the list of branches to be removed.
```


## `wiby result`



Use this command to fetch the results of your latest test against a dependent.
wiby will go off to the dependent’s repo and fetch the results of the CI run
against the patch branch wiby had created.

```
Options:

  --dependent  URL of a dependent                                       [string]
  --config     Path to the configuration file. By default it will try to load
               the configuration from the first file it finds in the current
               working directory: `.wiby.json`, `.wiby.js`              [string]
```


## `wiby test`



Use this command to test your breaking changes against any one of your
dependents. wiby will go off to the dependent’s repo and create a branch with a
patch to the  `package.json` pointing to your latest version (with the new
changes) triggering the dependent’s CI to run.

```
Options:

  --dependent  URL of a dependent                                       [string]
  --config     Path to the configuration file. By default it will try to load
               the configuration from the first file it finds in the current
               working directory: `.wiby.json`, `.wiby.js`              [string]
```


## `wiby validate`



Check the structure of the configuration file.

```
Options:

  --config   Path to the configuration file. By default it will try to load the
             configuration from the first file it finds in the current working
             directory: `.wiby.json`, `.wiby.js`                        [string]
```

