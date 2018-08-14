#!/usr/bin/env node
const path = require('path')
const rootPath = path.resolve(__dirname,'../')
const childProcess = require('child_process')

const result = childProcess.execSync(`pm2 show testing`).toString()
console.log(result)
