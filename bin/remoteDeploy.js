#!/usr/bin/env node

const gitCmd = require('simple-git')
gitCmd.pull(()=>{
    console.log(arguments)

})
