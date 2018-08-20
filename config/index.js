

const diffConfig = require('./diffConfigInterface')
const _ = require('lodash')
const assert = require('assert')
const txServerIp = "http://192.144.200.234/"

assert(process.env.NODE_ENV)

const envConfig = require(`./config.${process.env.NODE_ENV}.js`)


const config = {
    db:{
        database:"LK_S",
        dialect:"mysql",
    },
    superDefaultPassword:"1b3231655cebb7a1f783eddf27d254ca",
    encrypt:{
        publicKeyFormat:"pkcs8-public-der",
        privateKeyFormat:"pkcs1-der",
        signatureFormat:"hex",
        sourceFormat:"utf8",
        aesKey:[ 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16 ]
    },
    ip:txServerIp,
    port:"3000",
    wsPort:"3001",
    repo:"https://github.com/tracelessman/LK-S.git",
    branch:"master"

}
//diffConfg override envConfig,envConfig override config

_.merge(config,envConfig,diffConfig)


Object.freeze(config)

module.exports = config
