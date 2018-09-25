const Sequelize = require('sequelize')
const uuidV4 = require('uuid/v4')
const config = require('../../../config')

const key = 'org'

const tableTitle = ''

module.exports = {
  key,
  modelContent: {
    name: {
      title: '组织名称'
    },
    parentId: {
      title: '父ID'
    },
    mCode: {
      title: '节点hash值'// name - >hash
    },
    // memberMCode:{
    //     title:"成员hash值"//id排序 => hash
    // },
    reserve1: {
      type: Sequelize.TEXT
    }

  },

  tableTitle
}
