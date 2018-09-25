const clipboardy = require('clipboardy')
const path = require('path')
const rootPath = path.resolve(__dirname, '../')
const config = require(path.resolve(rootPath, 'config'))
const debug = require('debug')('ssh')
const {txServerIp} = config
debug({config})
clipboardy.writeSync(`ssh root@${txServerIp}`)
