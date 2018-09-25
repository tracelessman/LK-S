const Sequelize = require('sequelize')

const key = 'user'

const tableTitle = '管理员管理'

module.exports = {
  key,
  modelContent: {
    name: {
      title: '用户名',
      unique: true
    },
    registerStartTime: {
      title: '注册开始时间',
      type: Sequelize.DATE
    },
    registerTimeout: {
      title: '注册有效期',
      type: Sequelize.INTEGER
    },
    password: {
      title: '密码'
    },
    publicKey: {
      type: Sequelize.BLOB
    },
    privateKey: {
      type: Sequelize.BLOB
    }
  },
  tableTitle
}
