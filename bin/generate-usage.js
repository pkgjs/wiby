#!/usr/bin/env node

/**
 * Builds new content for USAGE.md page according to wiby.js --help commands list
 */

const { execSync } = require('child_process')
const path = require('path')
const wibyCommand = path.join(__dirname, '..', 'bin', 'wiby.js')
const cwd = path.join(__dirname, '..')
const fs = require('fs')

/**
 * Parses wiby.js --help output and returns block with commands list
 */
const getGeneralHelpOutput = () => {
  const helpOutput = execSync(`${wibyCommand} --help`, { cwd: cwd }).toString()
  const helpParseResult = /(Commands:\n)([\S\s]+)(Options:)/.exec(helpOutput)

  if (helpParseResult !== null) {
    return helpParseResult[2].trim()
  } else {
    throw new Error('wiby help command parsing failed')
  }
}

/**
 * Parses commands list block ands returns array of commands names
 */
const parseCommandsListOutput = (commandsOutput) => {
  // parse commands list
  const re = /wiby\.js ([\w]+)/g
  const commandsList = []
  let commandsParseResult
  while ((commandsParseResult = re.exec(commandsOutput)) !== null) {
    commandsList.push(commandsParseResult[1])
  }

  return commandsList
}

/**
 * Calls --help option for each command and returns
 * array of Maps with command name and help output
 */
const getCommandsHelp = (commandsList) => {
  // get help for each command
  const commandsHelp = []
  commandsList.map((command) => {
    const commandHelpOutput = execSync(`${wibyCommand} ${command} --help`, { cwd: cwd }).toString()

    const commandData = new Map()
    commandData.set('commandName', command)
    commandData.set('help', commandHelpOutput.trim())

    commandsHelp.push(commandData)
  })

  return commandsHelp
}

/**
 * Generates new markdown for USAGE page
 */
const generateUsageMd = (commandsData) => {
  let usageMd = ''
  commandsData.map((command) => {
    usageMd += `
## ${command.get('commandName')}

\`\`\`
${command.get('help')}
\`\`\`
`
  })

  return usageMd
}

const commandsList = getGeneralHelpOutput()
const commandsListParsed = parseCommandsListOutput(commandsList)
const commandsHelp = getCommandsHelp(commandsListParsed)
const resultMd = generateUsageMd(commandsHelp)

// write result to USAGE.md
fs.writeFileSync(path.join(__dirname, '..', 'USAGE.md'), resultMd)
