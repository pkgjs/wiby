'use strict'

const fs = require('fs')
const path = require('path')

exports.getFiles = fs.readFileSync(path.join(__dirname, 'getFiles.graphql')).toString()

exports.getWibyBranches = fs.readFileSync(path.join(__dirname, 'getWibyBranches.graphql')).toString()

exports.getDefaultBranch = fs.readFileSync(path.join(__dirname, 'getDefaultBranch.graphql')).toString()
