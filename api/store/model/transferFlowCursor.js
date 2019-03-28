const Sequelize = require('sequelize')
const uuidV4 = require('uuid/v4')
const config = require('../../../config')

const key = 'transferFlowCursor'

const tableTitle = ''

module.exports = {
    key,
    modelContent: {
        serverIP: {
        },
        serverPort: {
            type: Sequelize.INTEGER
        },
        flowType: {
        },
        flowId: {
            allowNull: true
        }

    },

    tableTitle
}
