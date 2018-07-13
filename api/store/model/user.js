const Sequelize = require('sequelize')
const uuidV4 = require('uuid/v4')


const key = 'user'

const tableTitle = '管理员管理'


module.exports = {
    key,
    modelContent:{
        name:{
            title:"用户名",
            unique:true
        },
        password:{
            title:"密码",
            type:Sequelize.TEXT,
        },
        pic:{
            title:"头像",
            allowNull:true,
            type:Sequelize.TEXT,
        },
        registerStartTime:{
            title:"注册开始时间",
            type:Sequelize.INTEGER,
        },
        registerTimeout:{
            title:"注册有效期",
            type:Sequelize.INTEGER
        },
        registerCheckCode:{
            title:"口令",
            allowNull:true
        },
        orgId:{
            title:"组织id",
        },
        hcode:{
            title:"节点哈希值",
            type:Sequelize.TEXT,
            allowNull:true,
        },
        mcode:{
            title:"子节点哈希值",
            type:Sequelize.TEXT,
            allowNull:true,
        },
        reserve1:{
            type:Sequelize.TEXT,
            allowNull:true,
        },
        reserve2:{
            type:Sequelize.TEXT,
            allowNull:true,
        },
        reserve3:{
            type:Sequelize.TEXT,
            allowNull:true,
        },
    },
    tableTitle,
}


