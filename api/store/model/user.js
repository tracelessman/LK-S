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
        registerStartTime:{
            title:"注册开始时间",
            type:Sequelize.DATE,
        },
        registerTimeout:{
            title:"注册有效期",
            type:Sequelize.INTEGER
        },
        registerCheckCode:{
            title:"注册验证码",
            allowNull:true
        },
        password:{
            title:"密码"
        }
    },
    tableTitle,
}


