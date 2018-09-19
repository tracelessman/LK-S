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
const {SSHUtil} = require('@ys/collection')
const {execCommand: execCommandCollection} = SSHUtil
const _ = require('lodash')

const config = require(path.resolve(rootPath, 'config'))
;(async () => {
  const option = {
    host: config.ip,
    username: config.sshInfo.username,
    password: config.sshInfo.password
  }
  await ssh.connect(option)
  const folderName = 'testing'
  const basePath = '/opt'
  const testingFolder = path.resolve(basePath, folderName)
  const projectFolder = path.resolve(testingFolder, getRepoName(config.repo))
  let cmd = `
  git reset --hard;
  git pull;
  `
  const result = await execCommand(cmd, projectFolder)
  if (result.includes('package.json')) {
    await execCommand(`npm install --production`, projectFolder)
  }
  cmd = `
  npm i;
  npm run runAllDev;
  `
  await execCommand(cmd, projectFolder)
  ssh.dispose()
  info(['testing deployment updated'])
})().catch(err => {
  error([err])
})

function execCommand (cmd, cwd, option = {}) {
  _.merge(option, {
    cmd,
    cwd,
    ssh
  })
  return execCommandCollection(option)
}
