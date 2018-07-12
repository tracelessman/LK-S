const path = require('path')
const rootPath = path.resolve(__dirname,'../')
const diffConfig = require(path.resolve(rootPath,'config/diffConfig'))
const _ = require('lodash')

const config = {
    db:{
        database:"LK_S",
        dialect:"mysql",
        storageDb:path.resolve(rootPath,'store/data/lk.db'),
    },
}
_.merge(config,diffConfig)

module.exports = config
