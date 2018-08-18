const _ = require('lodash')

const util = _.merge({},
    require('./commonUtil'),
    require('./storeUtil'),
    require('./sequelizeUtil'),
    require('./ormUtil'),
    require('./routeUtil'),
    // require('./codeUtil'),
)

Object.freeze(util)

module.exports = util
