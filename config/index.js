const path = require('path')


const diffConfig = require('./diffConfig')
const _ = require('lodash')

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
    }

}
_.merge(config,diffConfig)

module.exports = config
