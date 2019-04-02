const Sequelize = require('sequelize')
const uuidV4 = require('uuid/v4')
const config = require('../../../config')

const key = 'friend'

const tableTitle = ''

module.exports = {
    key,
    modelContent: {
        memberId: {
            title: '成员ID',
            type: Sequelize.STRING,
            primaryKey: true
        },
        contactId: {
            type: Sequelize.STRING,
            primaryKey: true
        }

    },

    tableTitle
}
