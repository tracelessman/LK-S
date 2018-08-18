const cmdUtil = require('./util/cmdUtil')
const objectUtil = require('./util/objectUtil')

const external = {
    cmdUtil,
    objectUtil
}

Object.freeze(external)
module.exports = external
