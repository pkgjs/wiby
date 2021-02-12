'use strict'

const fs = require('fs')
const path = require('path')

exports.getPackageJson = fs.readFileSync(path.join(__dirname, 'getPackageJson.graphql')).toString()
