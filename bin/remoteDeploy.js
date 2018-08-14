#!/usr/bin/env node
const path = require('path')
const rootPath = path.resolve(__dirname,'../')
const childProcess = require('child_process')
try{
    childProcess.execSync(`pm2 show testing`).toString()
}catch(err){
    const startPath = path.resolve(rootPath,'bin/start.js')
    const cmd = `pm2 start ${startPath} --name=testing`
    console.log(cmd)
    childProcess.execSync(cmd)
}
const result = childProcess.execSync(`pm2 show testing`).toString()
console.log(result)
