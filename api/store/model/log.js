const Sequelize = require('sequelize')
const uuidV4 = require('uuid/v4')
const config = require('../../../config')

const key = 'log'

const tableTitle = ''

module.exports = {
    key,
    modelContent: {
        action: {

        },
        description: {
            type: Sequelize.TEXT
        },
        time: {
            type: Sequelize.INTEGER
        },
        type: {
            type: Sequelize.INTEGER
        }

    },

    tableTitle
}
