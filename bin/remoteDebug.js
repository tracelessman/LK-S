const path = require('path')
const rootPath = path.resolve(__dirname, '../')
const childProcess = require('child_process')
const config = require(path.resolve(rootPath, 'config'))
const {txServerIp} = config

childProcess.execSync(`
ssh -L 9221:localhost:9229 root@${txServerIp}
`)
