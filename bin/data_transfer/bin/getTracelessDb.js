const NodeSsh = require('node-ssh')
const path = require('path')

const config = require('../config')
const {originServer} = config

start()

async function start() {
  const ssh = new NodeSsh()
  const option = {
    host: originServer.ip,
    username: originServer.user,
    password: originServer.password
  }
  await ssh.connect(option)
  console.log('start downloading...')
  await ssh.getFile(config.local_sqlite_db_path, config.remote_sqlite_db_path)
  console.log(`downloaded to ${config.local_sqlite_db_path}`)
  ssh.dispose()
}
