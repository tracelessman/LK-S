const Sequelize = require('sequelize')
const uuidV4 = require('uuid/v4')
const config = require('../../../config')

const key = 'meta'

const tableTitle = ''


module.exports = {
    key,
    modelContent:{
        superPassword:{

        },
        publicIp:{

        }

    },
    afterSync:(modelSequelized)=>{
        modelSequelized.create({
            id:uuidV4(),
            publicIp:config.publicIp,
            superPassword:config.superDefaultPassword
        })
    },
    tableTitle,
}


