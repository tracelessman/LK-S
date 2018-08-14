/* eslint-disable no-console */

//git,node,pm2 should be installed on the remote server
const NodeSSH = require('node-ssh')
const ssh = new NodeSSH()
const path = require('path')
const rootPath = path.resolve(__dirname,'../')
const {cmdUtil} = require("@ys/external");
const assert = require('assert');

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
    const testingFolder = path.resolve(basePath,folderName)
    const projectFolder = path.resolve(testingFolder,getRepoName(config.repo))

    if(!content){
        const cmd = `git clone --branch=${config.branch} ${config.repo}`
        console.log(cmd)
        console.log('git cloning ....')
        await execCommand(cmd,testingFolder)
        await execCommand(`npm install --production`,projectFolder)
    }
    await execCommand(`node remoteDeploy.js`,path.resolve(projectFolder,'bin'),{print:true})
    ssh.dispose()

})().catch(err=>{
    console.log(err)
})

async function execCommand(cmd,cwd,option={}){
    const {print} = option

    const result = await ssh.execCommand(cmd, { cwd })

    const {stdout,stderr} = result
    if(stdout){
        if(print){

            console.log(print)
        }
        return stdout
    }
    if(stderr){

        throw new Error(stderr)
    }
}



function getRepoName(repo){
    assert(typeof repo === 'string')
    const result = repo.split('/').pop().replace(".git","")
    return result
}
