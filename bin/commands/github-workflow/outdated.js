'use strict'

const fs = require('fs')
const path = require('path')

exports.desc = 'Check if you have the bundled version of wiby Github workflow installed.'

exports.handler = async (params) => {
  const packageRoot = process.env.INIT_CWD || process.cwd()

  const workflowsPath = path.join(packageRoot, '.github', 'workflows')
  const sourceWibyYaml = path.join(__dirname, '..', '..', '..', '.github', 'workflows', 'wiby.yaml')
  const destWibyYaml = path.join(workflowsPath, 'wiby.yaml')

  if (!fs.existsSync(destWibyYaml)) {
    console.error(`${destWibyYaml} not found. Use \`wiby github-workflow install\` to install it.`)
    process.exit(1)
  }

  const expectedContents = fs.readFileSync(sourceWibyYaml)
  const actualContents = fs.readFileSync(destWibyYaml)

  if (Buffer.compare(expectedContents, actualContents) !== 0) {
    console.error(`${destWibyYaml} is not the same as the bundled version at ${sourceWibyYaml}. Use \`wiby github-workflow install\` to install it.`)
    process.exit(1)
  }

  console.log(`${destWibyYaml} is the same as the bundled version.`)
}
