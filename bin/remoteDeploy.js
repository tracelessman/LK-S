#!/usr/bin/env node
const path = require('path')
const rootPath = path.resolve(__dirname,'../')
const childProcess = require('child_process')

const gitCmd = require('simple-git')(rootPath)
console.log('noew')

const result = childProcess.execSync(`git pull`).toString()
console.log('good')

console.log(result)

