/* eslint-disable global-require */
const _ = require('lodash')
const txServerIp = '192.144.200.234'
const fs = require('fs')
const path = require('path')

const config = {
  db: {
    database: 'LK_S',
    dialect: 'mysql',
    username: 'root',
    password: ''
  },
  superDefaultPassword: '1b3231655cebb7a1f783eddf27d254ca',
  encrypt: {
    publicKeyFormat: 'pkcs8-public-der',
    privateKeyFormat: 'pkcs1-der',
    signatureFormat: 'hex',
    sourceFormat: 'utf8',
    aesKey: [ 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16 ]
  },
  ip: txServerIp,
  port: '3000',
  wsPort: '3001',
  repo: 'https://github.com/tracelessman/LK-S.git',
  branch: 'master',
  http: true,
  sshInfo: {
    username: 'root'
  }
}

let protocol
if (config.http) {
  protocol = 'http'
} else {
  protocol = 'https'
}
config.url = `${protocol}://${config.ip}:${config.port}`

const unversionedPath = path.resolve(__dirname, 'unversioned.js')
if (fs.existsSync(unversionedPath)) {
  _.merge(config, require(unversionedPath))
}

Object.freeze(config)

module.exports = config
