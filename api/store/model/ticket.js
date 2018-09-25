const Sequelize = require('sequelize')
const uuidV4 = require('uuid/v4')
const config = require('../../../config')

const key = 'ticket'

const tableTitle = ''

module.exports = {
  key,
  modelContent: {
    memberId: {
      title: '成员ID'
    },
    startTime: {
      title: '开始时间',
      type: Sequelize.DATE
    },
    timeout: {
      title: '有效期',
      type: Sequelize.INTEGER
    },
    checkCode: {
      allowNull: true,
      title: '口令'
    },
    reserve1: {
      allowNull: true,
      type: Sequelize.TEXT
    }

  },

  tableTitle
}
