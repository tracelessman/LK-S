const childProcess = require('child_process')
const os = require('os')

// assert(os.platform() === 'darwin')
let config = {}
if(os.platform() === 'darwin'){
    const cmd = 'ipconfig getifaddr en0'
    const ip = childProcess.execSync(cmd).toString().trim()

    config = {
        ip,
        db:{
            username:"root",
            password:"spirit12#"
        },
    }

}

Object.freeze(config)
module.exports = config
