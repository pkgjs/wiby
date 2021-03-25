#!/usr/bin/env node

'use strict'

/**
 * Builds new content for USAGE.md page according to wiby --help commands list
 */

const { execSync } = require('child_process')
const path = require('path')
const wibyCommand = path.join(__dirname, '..', 'bin', 'wiby')
const cwd = path.join(__dirname, '..')
const fs = require('fs')

/**
 * Parses wiby --help output and returns block with commands list
 */
const getGeneralHelpOutput = (commandWithSubCommands = '') => {
  const helpOutput = execSync(`${wibyCommand} ${commandWithSubCommands}--help`, { cwd: cwd }).toString()
  const helpParseResult = /(Commands:\n)([\S\s]+)(Options:)/.exec(helpOutput)

  if (helpParseResult !== null) {
    return helpParseResult[2]
  } else {
    throw new Error('wiby help command parsing failed')
  }
}

/**
 * Parses commands list block ands returns array of commands names
 */
const parseCommandsListOutput = (commandsOutput, commandWithSubCommands = '') => {
  // parse commands list
  const re = new RegExp(`^ {2}wiby ${commandWithSubCommands}([\\w-]+)`, 'gm')
  const commandsList = []
  let commandsParseResult
  while ((commandsParseResult = re.exec(commandsOutput)) !== null) {
    const [, command] = commandsParseResult
    if (command === 'github-workflow') {
      const subCommandsOutput = getGeneralHelpOutput(`${command} `)
      const subCommandList = parseCommandsListOutput(subCommandsOutput, `${command} `)
      commandsList.push(...subCommandList.map((subCommand) => `${command} ${subCommand}`))
    } else {
      commandsList.push(command)
    }
  }

  return commandsList
}

/**
 * Calls --help option for each command and returns
 * array of Maps with command name and help output
 */
const getCommandsHelp = (commandsList) => {
  // get help for each command
  return commandsList.map((command) => {
    const commandHelpOutput = execSync(`${wibyCommand} ${command} --help`, { cwd: cwd })
      .toString()
      .trim()
      .replace(/^\s+--version.*$/m, '')
      .replace(/^\s+--help.*$/m, '')

    const commandData = new Map()
    commandData.set('commandName', command)
    commandData.set('help', commandHelpOutput)

    return commandData
  })
}

const renderCommand = (command) => {
  return `
## \`wiby ${command.get('commandName')}\`

${command.get('help').replace(/^wiby.*$/m, '').replace(/Options:\s+$/, '').replace(/Options:(.+)$/s, '```\n$&\n```')}
`
}

/**
 * Generates new markdown for USAGE page
 */
const renderUsage = (commandsData) => {
  return `# Usage
  
${commandsData.map((command) => renderCommand(command)).join('\n')}
`
}

const commandsList = getGeneralHelpOutput()
const commandsListParsed = parseCommandsListOutput(commandsList)
const commandsHelp = getCommandsHelp(commandsListParsed)
const resultMd = renderUsage(commandsHelp)

// write result to USAGE.md
fs.writeFileSync(path.join(__dirname, '..', 'USAGE.md'), resultMd)
