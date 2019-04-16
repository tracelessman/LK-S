const {URL} = require('url')
const childProcess = require('child_process')

const config = require('../config')

const {txServerUrl, updateJsonPath} = config

const pathSeperator = '/'

const urlPath = new URL(updateJsonPath.split(pathSeperator).slice(1).join(pathSeperator), txServerUrl)

const cmd = `open ${urlPath}`

console.log(`executing: ${cmd}`)
childProcess.execSync(cmd)
