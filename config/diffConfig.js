const childProcess = require('child_process')
const os = require('os')

const diffConfig = {
    db:{
        username:"root",
        password:"spirit12#"
    },
    port:"3000",
    wsPort:"3001",
    ip:""


}
if(os.platform()==='darwin'){
    const cmd = 'ipconfig getifaddr en0'
    const localIp = childProcess.execSync(cmd,{encoding:'utf8'})
    diffConfig.ip = localIp.trim()
    console.log(diffConfig.ip)

}

Object.freeze(diffConfig)

module.exports = diffConfig
