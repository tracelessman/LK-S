const NodeSSH = require('node-ssh')
const ssh = new NodeSSH()
const path = require('path')
const rootPath = path.resolve(__dirname,'../')
const {cmdUtil} = require("@ys/external");


(async()=>{
    await cmdUtil.getEnv()
    const config = require(path.resolve(rootPath,'config'))
    const option = {
        host:config.ip,
        username: config.sshInfo.username,
        password: config.sshInfo.password
    }
    await ssh.connect(option)
    const folderName = 'testing'
    const basePath = '/opt'
    await execCommand(`mkdir -p ${folderName}`,basePath)
    const content = await execCommand('ls',path.resolve(basePath,folderName))
    if(!content){
        await execCommand(`git clone ${config.repo}`,path.resolve(basePath,folderName))
    }
    process.exit()
})()

async function execCommand(cmd,cwd){
    const result = await ssh.execCommand(cmd, { cwd })

    const {stdout,stderr} = result
    if(stdout){
        console.log(stdout)
        return stdout
    }
    if(stderr){
        throw new Error(stderr)
    }
}
