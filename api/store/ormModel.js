const store = require('./index')
const Sequelize = require('sequelize')
const uuidV4 = require('uuid/v4')
const _ = require('lodash')
const path = require('path')
const rootPath = path.resolve(__dirname, '../../')
const {mainDbPromise} = require(path.resolve(rootPath, 'api/store'))

const dict = require(path.resolve(rootPath, 'business/dict'))
const util = require(path.resolve(rootPath, 'api/util'))

const ormModelPromise = mainDbPromise.then(mainDb => {
  const option = {
    modelAry: [
      require(path.resolve(rootPath, 'api/store/model/member')),
      require(path.resolve(rootPath, 'api/store/model/meta')),
      require(path.resolve(rootPath, 'api/store/model/org')),
      require(path.resolve(rootPath, 'api/store/model/ticket')),
      require(path.resolve(rootPath, 'api/store/model/user')),
      require(path.resolve(rootPath, 'api/store/model/device')),
      require(path.resolve(rootPath, 'api/store/model/flow')),
      require(path.resolve(rootPath, 'api/store/model/friend')),
      require(path.resolve(rootPath, 'api/store/model/groupChat')),
      require(path.resolve(rootPath, 'api/store/model/groupMember')),
      require(path.resolve(rootPath, 'api/store/model/log')),
      require(path.resolve(rootPath, 'api/store/model/magicCode')),
      require(path.resolve(rootPath, 'api/store/model/message')),
      require(path.resolve(rootPath, 'api/store/model/transferFlowCursor'))
    ],
    dict,
    database: mainDb
  }
  const orm = util.getOrmModel(option)
  return orm
})

module.exports = {
  ormModelPromise
}
