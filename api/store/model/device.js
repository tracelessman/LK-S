const Sequelize = require('sequelize')
const uuidV4 = require('uuid/v4')
const config = require('../../../config')

const key = 'device'

const tableTitle = ''

module.exports = {
    key,
    modelContent: {
        memberId: {
            title: '成员ID'
        },
        venderDid: {
            allowNull: true
        },
        description: {
            allowNull: true
        },
        pk: {
            allowNull: true,
            type: Sequelize.TEXT
        },
        lastActiveTime: {
            type: Sequelize.DATE
        },
        alive: {
            type: Sequelize.INTEGER
        },
        reserve1: {
            allowNull: true,
            type: Sequelize.TEXT
        }

    },

    tableTitle
}
