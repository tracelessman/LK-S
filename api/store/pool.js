const mysql = require('mysql2')
const config = require('../../config')

const pool  = mysql.createPool({
    connectionLimit : 10,
    host            : 'localhost',
    user            : config.db.username,
    password        : config.db.password,
    database        : config.db.database
});


const p1 = new Promise(resolve => {
    pool.execute(`
CREATE TABLE IF NOT EXISTS org 
(
    id varchar(36),
    name varchar(100),
    parentId varchar(36),
    mCode varchar(32),
    memberMCode varchar(32),
    reserve1 TEXT,
    PRIMARY KEY (id)
)
`,(err,result)=>{
        if(err){
            console.log(err)
            throw err
        }else{
            resolve(result)
        }
    })
})


const p2 = new Promise(resolve => {
    pool.execute(`
CREATE TABLE IF NOT EXISTS member 
(
    id varchar(36),
    name varchar(100),
    pic TEXT,
    orgId varchar(36),
    mCode varchar(32),
    reserve1 TEXT,
    PRIMARY KEY (id)
)
`,(err,result)=>{
        if(err){
            console.log(err)
            throw err
        }else{
            resolve(result)
        }
    })
})
const p3 = new Promise(resolve => {
    pool.execute(`
CREATE TABLE IF NOT EXISTS ticket 
(
    id varchar(36),
    memberId varchar(36),
    startTime int,
    timeout int,
    checkCode varchar(6),
    reserve1 TEXT,
    PRIMARY KEY (id)
)
`,(err,result)=>{
        if(err){
            console.log(err)
            throw err
        }else{
            resolve(result)
        }
    })
})

pool.execute(`CREATE DATABASE if not exists ${config.db.database}`, function (err, result) {
    if (err) throw err;
    Promise.all([p1,p2,p3])
});

module.exports = pool
