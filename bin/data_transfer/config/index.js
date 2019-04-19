
const fs = require('fs')
const path = require('path')
const _ = require('lodash')

const index = {
  originServer: {
    ip: '192.144.172.30',
    user: 'root',
    password: ''
  },
  targetServer: {
    ip: '62.234.46.12',
    user: 'root',
    password: '',
    mysqlUser: '',
    mysqlPassword: ''
  },
  sqlite_file_name: 'traceless-transfer-db',
  // 本地sqlite 地址
  local_sqlite_db_path: '',
  remote_sqlite_db_path: '/opt/traceless-transfer/traceless-transfer-db'
}

const unversionedPath = path.resolve(__dirname, 'unversioned.js')
if (fs.existsSync(unversionedPath)) {
  _.merge(index, require(unversionedPath).getConfig(index))
}

Object.freeze(index)
module.exports = index
