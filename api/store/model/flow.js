const Sequelize = require('sequelize')
const uuidV4 = require('uuid/v4')
const config = require('../../../config')

const key = 'flow'

const tableTitle = ''

module.exports = {
    key,
    modelContent: {
        msgId: {
        },
        targetUid: {

        },
        targetDid: {

        },
        preFlowId: {

        },
        flowType: {

        },
        random: {
            type: Sequelize.TEXT
        },
        targetServerIP: {

        },
        targetServerPort: {
            type: Sequelize.INTEGER

        },
        targetText: {
            type: Sequelize.TEXT
        },
        lastSendTime: {
            type: Sequelize.DATE
        },
        reserve1: {
            allowNull: true,
            type: Sequelize.TEXT
        }


    },

    tableTitle
}
