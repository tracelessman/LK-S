const NodeSSH = require('node-ssh')
const ssh = new NodeSSH()
const {CliUtil} = require('@ys/collection')
const {execSync} = CliUtil

execSync(`npx nuxt build`)
