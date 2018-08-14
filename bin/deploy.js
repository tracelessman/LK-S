const ssh = require('node-ssh')
const path = require('path')
const rootPath = path.resolve(__dirname,'../')
const {cmdUtil} = require("@ys/external");


(async()=>{
    await cmdUtil.getEnv()
    const config = require(path.resolve(rootPath,'config'))


})()
