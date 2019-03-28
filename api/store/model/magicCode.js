const Sequelize = require('sequelize')
const uuidV4 = require('uuid/v4')
const config = require('../../../config')

const key = 'magicCode'

const tableTitle = ''

module.exports = {
    key,
    modelContent: {
      orgMCode: {
          allowNull: true
      },
      memberMCode: {
          allowNull: true
      },
      reserve1: {
          allowNull: true,
          type: Sequelize.TEXT
      }
    },

    tableTitle
}
