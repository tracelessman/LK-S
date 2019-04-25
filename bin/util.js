const NodeSSH = require('node-ssh')
const inquirer = require('inquirer')

const config = require('../config')
const {serverHostAry} = config

class util {
  static upload ({local, remote}) {
    return new Promise(async (resolve) => {
      const question = [
        {
          type: 'list',
          name: 'server',
          message: 'Which server do you want to upload ?',
          choices: serverHostAry.concat('all')
        }
      ]
      const answer = await inquirer.prompt(question)
      const {server} = answer
      let ary = []
      if (server === 'all') {
        ary = ary.concat(serverHostAry)
      } else {
        ary = ary.concat(server)
      }
      ary.forEach(async (ele) => {
        const option = {
          host: ele,
          username: config.sshInfo.username,
          password: config.sshInfo.password
        }
        const ssh = new NodeSSH()
        await ssh.connect(option)
        ssh.putFiles([{local, remote}]).then(() => {
            console.log(`upload ${local} to ${remote} in the server`)
            resolve()
            ssh.dispose()
          },
          (error) => {
            console.log("Something's wrong")
            console.log(error)
            ssh.dispose()
          })
      })
    })
  }
}

Object.freeze(util)
module.exports = util
