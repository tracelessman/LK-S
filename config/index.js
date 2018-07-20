const path = require('path')


const diffConfig = require('./diffConfig')
const _ = require('lodash')

const config = {
    db:{
        database:"LK_S",
        dialect:"mysql",
    },
    superDefaultPassword:"1b3231655cebb7a1f783eddf27d254ca"
}
_.merge(config,diffConfig)

module.exports = config
