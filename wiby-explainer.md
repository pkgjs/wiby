# Wiby Explainer

OK, so I did not quite understand what Wiby was doing so here are the notes that I made along my path of understanding it.

The entry point calls *test* which in turn calls on the *wiby* validate function and then the test function. The test
command can take either a URL of a dependent or a file path to a configuration file.

The test handler creates a config from either the sole dependent or the file. If a file is passed it is validated using
[joi](https://www.npmjs.com/package/joi) which is a JS data validator. The file is read and the scheme is checked against
that defined as valid.

The call is made on wiby to test with the configuration.

The dependents are destructed from the configuration object passed as an argument to the *test* function.

## local module data
Data on the local package json is read. The data is parsed using the *git-url-parse* module to get the owner and name of
the parent module. The last commit hash URL for the parent is read from github.

## Loop over the dependent(s)
The repository array is looped over. The url is parsed and the dependent *owner* and *name* are found. The package json
is read from github. *Please note that this uses the octokit/graphql module that uses the operatons GITHUB_TOKEN and an
implicit assumption is made , the master branch is assumed to be the main branch, this is in general not the normal
practice and we will have to query repository for the main branch.*

A check is made on the dependent's package json to make sure that it has the parent as a dependency.

### Apply the patch
The *applyPatch* function is called, it is passed the change via the commitURL, in addition to the parent's package name
and the dependent pkg json itself. After checking that the module exists in the dependent's pkg json the dependencies
are patched with the commitURL passed to it.

### Push the patch







