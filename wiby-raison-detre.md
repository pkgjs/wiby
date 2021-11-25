WIBY (**W**ill **I** **B**reak **Y**ou)

The term **depenedent** shall mean an npm package that consumes another npm package, called a **dependency**, directly
or indirectly via a tree of reliance through the package.json file. The **wiby** program exists to create a notification to the *dependent* 
package maintainers of changes made in a dependency. The **WIBY** program, when configured correctly, will raise a Pull 
Request against the dependent package informing of the change. The **intent** is to provide a notification of possible 
breakages of the dependent due to reliance on a dependency. No distinction is made between dev and non-dev dependencies.
They are all dependencies that could break "the-example-dependent" in some operational or test manner.

## Examples

The following is the most simple use case.

The dependent npm package has the following package.json file
```json
{
  "name": "the-example-dependent",
  "version": "1.0.0",
  "description": "",
  "main": "index.js",
  "scripts": {
    "test": "Some Test Commands ..."
  },
  "keywords": [],
  "author": "",
  "license": "ISC",
  "devDependencies": {
    "tap": "^15.1.2"
  },
  "dependencies": {
    "fastify": "^3.24.0"
  }
}
```
In this simple case the **dependent** package is called "the-example-dependent" and the dependencies are 
* tap
* fastify

If WIBY were configured in the dependencies **tap** and **fastify** then changes in the these dependencies would raise a
Pull Request agaist the "the-example-dependent" when the WIBY command was run within these repositories.

...TODO

example 1 working example with a single dependent and dependency. using github actions to build the dependency and run
wiby on the dependent repo.

This does raise questions about where code should be stored, this is very github dependent.

from the examples that you create, write the documentation based on your experiences and add in notes and things you 
discover on the way.
