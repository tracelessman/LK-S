const path = require('path')
const rootPath = path.resolve(__dirname, '../')
const config = require(path.resolve(rootPath, 'config'))
const {txServerIp} = config
const clipboardy = require('clipboardy')
clipboardy.writeSync(`
ssh -L 9221:localhost:9229 root@${txServerIp}
`)
