const Sequelize = require('sequelize')
const uuidV4 = require('uuid/v4')
const config = require('../../../config')

const key = 'message'

const tableTitle = ''

module.exports = {
    key,
    modelContent: {
        parentId: {
            title: '成员ID'
        },
        action: {

        },
        senderUid: {

        },
        senderDid: {

        },
        senderServerIP: {

        },
        senderServerPort: {
            type: Sequelize.INTEGER
        },
        sign: {
            type: Sequelize.TEXT
        },
        body: {

        },
        sendTime: {
            allowNull: true
        },
        time: {
            type: Sequelize.DATE
        },
        timeout: {
            type: Sequelize.INTEGER
        },
        reserve1: {
            allowNull: true,
            type: Sequelize.TEXT
        }


    },

    tableTitle
}
