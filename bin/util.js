const NodeSSH = require('node-ssh')
const ssh = new NodeSSH()
const config = require('../config')

class util {
  static upload ({local, remote}) {
    return new Promise(async (resolve) => {
      const option = {
        host: config.txServerIp,
        username: config.sshInfo.username,
        password: config.sshInfo.password
      }
      // console.log({option})
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
  }
}

Object.freeze(util)
module.exports = util
