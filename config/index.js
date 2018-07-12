const path = require('path')


const diffConfig = require('./diffConfig')
const _ = require('lodash')

const config = {
    db:{
        database:"LK_S",
        dialect:"mysql",
    },
}
_.merge(config,diffConfig)

module.exports = config
