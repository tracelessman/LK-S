const mysql = require('mysql2')
const config = require('../../config')

const option = {
    connectionLimit : 10,
    host            : 'localhost',
    user            : config.db.username,
    password        : config.db.password,
    database        : config.db.database
}
const pool  = mysql.createPool(option);

pool.execute(`CREATE DATABASE if not exists ${config.db.database}`, function (err, result) {
    if (err) throw err;

    const p0 = new Promise(resolve => {
        pool.query(`
CREATE TABLE IF NOT EXISTS magicCode 
(
    id int,
    orgMCode varchar(32),
    memberMCode varchar(32),
    reserve1 TEXT,
    PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8
`,(err,result)=>{
            if(err){
                console.log(err)
                throw err
            }else{
                resolve(result)
            }
        })
    })

    const p1 = new Promise(resolve => {
        pool.query(`
CREATE TABLE IF NOT EXISTS org 
(
    id varchar(36),
    name varchar(100),
    parentId varchar(36),
    mCode varchar(32),
    reserve1 TEXT,
    PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8
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
    serverIP varchar(45),
    serverPort int,
    reserve1 TEXT,
    PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8
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
    startTime datetime,
    timeout int,
    checkCode varchar(200),
    reserve1 TEXT,
    PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8
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
    lastActiveTime datetime,
    alive int,
    reserve1 TEXT,
    PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8
`,(err,result)=>{
            if(err){
                console.log(err)
                throw err
            }else{
                resolve(result)
            }
        })
    })

//     const p5 = new Promise(resolve => {
//         pool.query(`
// CREATE TABLE IF NOT EXISTS contact
// (
//     id varchar(36),
//     name varchar(100),
//     pic TEXT,
//     serverIP varchar(45),
//     serverPort int,
//     mCode varchar(32),
//     reserve1 TEXT,
//     PRIMARY KEY (id)
// )
// `,(err,result)=>{
//             if(err){
//                 console.log(err)
//                 throw err
//             }else{
//                 resolve(result)
//             }
//         })
//     })

//     const p6 = new Promise(resolve => {
//         pool.query(`
// CREATE TABLE IF NOT EXISTS contactDevice
// (
//     id varchar(36),
//     contactId varchar(36),
//     description varchar(100),
//     pk TEXT,
//     reserve1 TEXT,
//     PRIMARY KEY (id)
// )
// `,(err,result)=>{
//             if(err){
//                 console.log(err)
//                 throw err
//             }else{
//                 resolve(result)
//             }
//         })
//     })

    const p7 = new Promise(resolve => {
        pool.query(`
CREATE TABLE IF NOT EXISTS friend 
(
    memberId varchar(36),
    contactId varchar(36),
    PRIMARY KEY (memberId,contactId)
) ENGINE=InnoDB DEFAULT CHARSET=utf8
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
CREATE TABLE IF NOT EXISTS message 
(
    id varchar(36),
    action varchar(50),
    senderUid varchar(36),
    senderDid varchar(36),
    senderServerIP varchar(45),
    senderServerPort int,
    sign TEXT,
    body TEXT,
    senderTime datetime,
    time datetime,
    timeout int,
    reserve1 TEXT,
    PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8
`,(err,result)=>{
            if(err){
                console.log(err)
                throw err
            }else{
                resolve(result)
            }
        })
    })


    const p9 = new Promise(resolve => {
        pool.query(`
CREATE TABLE IF NOT EXISTS flow 
(
    id varchar(15),
    msgId varchar(36),
    targetUid varchar(36),
    targetDid varchar(36),
    preFlowId varchar(15),
    flowType varchar(50),
    random TEXT,
    targetServerIP varchar(45),
    targetServerPort int,
    targetText TEXT,
    lastSendTime datetime,
    reserve1 TEXT,
    PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8
`,(err,result)=>{
            if(err){
                console.log(err)
                throw err
            }else{
                resolve(result)
            }
        })
    })

    const p10 = new Promise(resolve => {
        pool.query(`
CREATE TABLE IF NOT EXISTS log 
(
    uid varchar(36),
    action varchar(50),
    description TEXT,
    time int,
    type int
) ENGINE=InnoDB DEFAULT CHARSET=utf8
`,(err,result)=>{
            if(err){
                console.log(err)
                throw err
            }else{
                resolve(result)
            }
        })
    })

    const p11 = new Promise(resolve => {
        pool.query(`
CREATE TABLE IF NOT EXISTS groupChat 
(
    id varchar(36),
    name varchar(100),
    PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8
`,(err,result)=>{
            if(err){
                console.log(err)
                throw err
            }else{
                resolve(result)
            }
        })
    })

    const p12 = new Promise(resolve => {
        pool.query(`
CREATE TABLE IF NOT EXISTS groupMember 
(
    gid varchar(36),
    memberId varchar(36)
) ENGINE=InnoDB DEFAULT CHARSET=utf8
`,(err,result)=>{
            if(err){
                console.log(err)
                throw err
            }else{
                resolve(result)
            }
        })
    })

    const p13 = new Promise(resolve => {
        pool.query(`
CREATE TABLE IF NOT EXISTS transferFlowCursor 
(
    serverIP varchar(45),
    serverPort int,
    flowType varchar(50),
    flowId  varchar(15)
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

    Promise.all([p0,p1,p2,p3,p4,p7,p8,p9,p10,p11,p12,p13])
});

module.exports = pool
