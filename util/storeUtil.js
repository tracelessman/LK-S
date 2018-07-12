
const Sequelize = require('sequelize');
const Op = Sequelize.Op;
const fs = require('fs');
const fse = require('fs-extra')
const path = require('path');
const uuidV4 = require('uuid/v4')
const mysql = require('mysql2')

let sqlObj = {
    id:{
        type:Sequelize.STRING,
        primaryKey:true,
    },
    content:{
        type:Sequelize.TEXT,
        allowNull:false
    },
    time:{
        type:Sequelize.DATE,
        allowNull:false
    },
    //insert,update,delete三种类型
    type:{
        type:Sequelize.STRING,
        allowNull:false
    },
    tableName:{
        type:Sequelize.STRING,
        allowNull:false
    }

}
let sqlModel

function logging(sql){
    let type,tableName
    const typeAry = ['INSERT','UPDATE','DELETE']
    for(let typeEle of typeAry){
        if(sql.includes(typeEle)){
            type = typeEle.toLowerCase()
            tableName = sql.split('`')[1]
        }
    }
    if(type){
        sqlModel.create({
            id:uuidV4(),
            type,
            content:sql,
            time:new Date(),
            tableName
        })
    }
}


const storeUtil = {
    async setDb(option){
        const {mainDatabase,metaDatabase,username,password,dialect,metaDbStorage,mainDbStorage} = option
            if(dialect === 'mysql'){
                let option = {
                    dialect:'mysql',user:username,password
                }
                await Promise.all([this.createSchema({...option,database:metaDatabase}),this.createSchema({...option,database:mainDatabase})])
            }
        return new Promise(resolve=>{
            const metaDb =  new Sequelize(metaDatabase, username, password, {
                dialect,
                pool: {
                    max: 5,
                    idle: 30000,
                    acquire: 60000,
                },
                operatorsAliases: false,
                storage:metaDbStorage,
                logging:function (sql) {
                    // console.log("执行sql:"+sql);
                },
                freezeTableName:true
            })
            sqlModel = metaDb.define('T_Sql',sqlObj,)
            sqlModel.sync().then(()=>{
                const mainDb =  new Sequelize(mainDatabase, username, password, {
                    dialect,
                    pool: {
                        max: 5,
                        idle: 30000,
                        acquire: 60000,
                    },
                    operatorsAliases: false,
                    storage:mainDbStorage,
                    logging,
                    freezeTableName:true
                })
                resolve(mainDb)
            })
        })
    },
    createSchema(option){
        return new Promise(resovle=>{
            let {dialect,host,user,password,database} = option
            if(dialect === 'mysql'){
                if(!host){
                    host = 'localhost'
                }
                if(!user){
                    user = 'root'
                }
                const con = mysql.createConnection({
                    host,
                    user,
                    password
                });
                con.connect(function(err) {
                    if (err) throw err;
                    con.query(`CREATE DATABASE if not exists ${database}`, function (err, result) {
                        if (err) throw err;
                        resovle(result)
                        con.end();
                    });
                });

            }
        })

    }
}

module.exports = storeUtil
