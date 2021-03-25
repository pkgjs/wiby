'use strict'

const fs = require('fs')
const path = require('path')

exports.desc = 'Install the bundled versions of the wiby workflows.'

exports.handler = async (params) => {
  const packageRoot = process.env.INIT_CWD || process.cwd()

  const workflowsPath = path.join(packageRoot, '.github', 'workflows')
  const sourceWibyYaml = path.join(__dirname, '..', '..', '..', '.github', 'workflows', 'wiby.yaml')
  const destWibyYaml = path.join(workflowsPath, 'wiby.yaml')

  console.log(`Copying ${sourceWibyYaml} to ${workflowsPath}`)

  if (!fs.existsSync(workflowsPath)) {
    console.error(`${workflowsPath} folder does not exist.`)
    process.exit(1)
  }

  fs.copyFileSync(sourceWibyYaml, destWibyYaml)
}
