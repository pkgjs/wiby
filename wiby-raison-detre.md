WIBY (**W**ill **I** **B**reak **Y**ou)

## Purpose
Wiby is a tool that will inform and trigger actions on a package to inform it that a registered dependency change may break
it. This is different from triggering tests once a dependency has been published. The goal is to inform before publication.
This will answer the question, "will I break you?", not "did I break you?". This is preemptive action that can take place
before rather than after a dependent package is broken.

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


from the examples that you create, write the documentation based on your experiences and add in notes and things you 
discover on the way.

- This does raise questions about where code should be stored, this is very github dependent.
- Do we need a specific github action for wiby? Meaning in the market place
- how do we bridge the gap between the repo changes or PRs in the dependencies and the dependent only really understanding npm modules (not repos)
