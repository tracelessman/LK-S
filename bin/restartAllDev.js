/* eslint-disable no-console */

/*
1.git,node,pm2 should be installed on the remote server
2.this file is just for updating git repo on the remote server and should not contain too much logic,most operation should be
put into remoteDeploy.js
 */
const NodeSSH = require('node-ssh')
const ssh = new NodeSSH()
const path = require('path')
const rootPath = path.resolve(__dirname, '../')
const {GitUtil, CliUtil} = require('@ys/vanilla')
const {getRepoName} = GitUtil
const {info, error} = CliUtil
const {SSHUtil, CliUtil: CliUtilCol} = require('@ys/collection')
const {execCommand: execCommandCollection} = SSHUtil
const {getPid} = CliUtilCol
const _ = require('lodash')
const debug = require('debug')('restartAllDev')
const config = require(path.resolve(rootPath, 'config'))
const {argv} = require('yargs')
const {i: needInstall} = argv

start()

function start () {
  (async () => {
    const option = {
      host: config.txServerIp,
      username: config.sshInfo.username,
      password: config.sshInfo.password
    }
    debug({option})
    await ssh.connect(option)
    const folderName = 'testing'
    const basePath = '/opt'
    const testingFolder = path.resolve(basePath, folderName)
    const projectFolder = path.resolve(testingFolder, getRepoName(config.repo))
    let cmd = `
  git reset --hard;
  git pull; 
  `
    if (needInstall) {
      cmd += 'npm install --production;'
    }
    await execCommand(cmd, projectFolder)
    info(['already pulled and installed'])
    await execCommand('node bin/serverScript', projectFolder)
    info(['serverScript finished'])

    cmd = ''
    if (!getPid(3001)) {
      cmd += 'npm run startWs;'
    }
    if (!getPid(4001)) {
      cmd += 'npm run startWs:other;'
    }
    cmd += `
  npm run runAllNuxt;
  `
    await execCommand(cmd, projectFolder)
    ssh.dispose()
    info(['testing deployment updated'])
  })().catch(err => {
    error([err])
  })
}

function execCommand (cmd, cwd, option = {}) {
  _.merge(option, {
    cmd,
    cwd,
    ssh
  })
  return execCommandCollection(option)
}
