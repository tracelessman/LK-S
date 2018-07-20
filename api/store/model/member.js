const Sequelize = require('sequelize')
const uuidV4 = require('uuid/v4')
const config = require('../../../config')

const key = 'member'

const tableTitle = ''


module.exports = {
    key,
    modelContent:{
        name:{
            title:"姓名",
        },
        pic:{
            displayPage:[],
            type:Sequelize.TEXT,
            title:"头像"
        },
        orgId:{
            title:"组织ID"
        },
        mCode:{
            title:"节点hash值"
        },
        role:{
            title:"权限"
        },
        reserve1:{
            type:Sequelize.TEXT,
        }


    },

    tableTitle,
}


