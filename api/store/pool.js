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
    pool.query(`
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
    pool.query(`
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
    pool.query(`
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
const p4 = new Promise(resolve => {
    pool.query(`
CREATE TABLE IF NOT EXISTS device 
(
    id varchar(36),
    memberId varchar(36),
    venderDid varchar(100),
    description varchar(100),
    pk TEXT,
    lastActiveTime int,
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
const p5 = new Promise(resolve => {
    pool.query(`
CREATE TABLE IF NOT EXISTS message 
(
    id varchar(36),
    action varchar(50),
    senderUid varchar(36),
    senderDid varchar(36),
    senderServerIP varchar(45),
    senderServerPort int,
    targetUid varchar(36),
    targetDid varchar(36),
    targetServerIP varchar(45),
    targetServerPort int,
    sign TEXT,
    body TEXT,
    time int,
    lastSendTime int,
    timeout int,
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

const p6 = new Promise(resolve => {
    pool.query(`
CREATE TABLE IF NOT EXISTS contact 
(
    id varchar(36),
    name varchar(100),
    pic TEXT,
    serverIP varchar(45),
    serverPort int,
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

const p7 = new Promise(resolve => {
    pool.query(`
CREATE TABLE IF NOT EXISTS contactDevice 
(
    id varchar(36),
    contactId varchar(36),
    description varchar(100),
    pk TEXT,
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

const p8 = new Promise(resolve => {
    pool.query(`
CREATE TABLE IF NOT EXISTS friend 
(
    memberId varchar(36),
    contactId varchar(36)
    PRIMARY KEY (memberId,contactId)
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
    Promise.all([p1,p2,p3,p4,p5,p6,p7,p8])
});

module.exports = pool
