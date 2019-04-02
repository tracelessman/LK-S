const Sequelize = require('sequelize')
const uuidV4 = require('uuid/v4')
const config = require('../../../config')

const key = 'groupMember'

const tableTitle = ''

module.exports = {
    key,
    modelContent: {
        gid:{
            title: '群ID',
            type: Sequelize.STRING,
            primaryKey: true
        },
        memberId: {
            title: '成员ID',
            type: Sequelize.STRING,
            primaryKey: true
        }

    },

    tableTitle
}
