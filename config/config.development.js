const childProcess = require('child_process')
const os = require('os')
const assert = require('assert')

assert(os.platform() === 'darwin')
const cmd = 'ipconfig getifaddr en0'
const ip = childProcess.execSync(cmd).toString().trim()

const config = {
    ip
}

Object.freeze(config)
module.exports = config
