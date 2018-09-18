
const config = require('../../config')
const util = require('../util')

const option = {
  ...config.db,
  mainDatabase: config.db.database,
  metaDatabase: config.db.metaDatabase
}

module.exports = {
  mainDbPromise: util.setDb(option)
}
