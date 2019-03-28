const Sequelize = require('sequelize')
const uuidV4 = require('uuid/v4')
const config = require('../../../config')

const key = 'groupMember'

const tableTitle = ''

module.exports = {
    key,
    modelContent: {
        memberId: {
            title: '成员ID'
        }

    },

    tableTitle
}
