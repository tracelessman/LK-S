#!/usr/bin/env node
const path = require('path')
const rootPath = path.resolve(__dirname,'../')


const gitCmd = require('simple-git')(rootPath)
gitCmd.pull(()=>{
    console.log(arguments)

})
