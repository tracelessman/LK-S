const childProcess = require('child_process')
const os = require('os')

// assert(os.platform() === 'darwin')
let config = {
    db:{
        username:"root",
        password:"EO:hR>lHu3Dqa"
    },
}
if(os.platform() === 'darwin'){
    const cmd = 'ipconfig getifaddr en0'
    const ip = childProcess.execSync(cmd).toString().trim()

    config = {
        ip,

    }

}

Object.freeze(config)
module.exports = config
