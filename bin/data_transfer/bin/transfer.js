const sqlite3 = require('sqlite3')
const mysql = require('mysql2')
const uuid = require('uuid')
const moment = require('moment')
const crypto = require('crypto')
const NodeRSA = require('node-rsa')

const mCodeManager = require('../../../api/transfer/MCodeManager')
const config = require('../config')
const {targetServer, local_sqlite_db_path} = config
const db = new sqlite3.cached.Database(local_sqlite_db_path)

const option = {
  host: targetServer.ip,
  user: targetServer.mysqlUser,
  database: targetServer.database,
  password: targetServer.mysqlPassword,
  multipleStatements: true
}
const connection = mysql.createPool(option)

start()

async function start () {
  const tableResult = await runSql('show tables')
  const tableAry = tableResult.map(ele => ele.Tables_in_LK_S).filter(ele => !ele.endsWith('View'))
  let psAry = []
  for (let ele of tableAry) {
    const ps = runSql(`truncate table ${ele}`)
    psAry.push(ps)
  }
  await Promise.all(psAry.concat(prepare()))

  // tansfer group_member to groupMember
  const groupMemberAry = await runSqlSqlite('select * from group_members')
  psAry = []
  groupMemberAry.forEach(ele => {
    const sql = `insert into groupMember values ('${ele.gid}','${ele.uid}')`
    const ps = runSql(sql)
    psAry.push(ps)
  })
  await Promise.all(psAry)
  console.log('group member transfered')

  // transfer groups to groupChat
  const groupAry = await runSqlSqlite('select * from groups')
  psAry = []
  groupAry.forEach(ele => {
    const sql = `insert into groupChat values ('${ele.gid}', '${ele.name}')`
    const ps = runSql(sql)
    psAry.push(ps)
  })
  await Promise.all(psAry)
  console.log('group chat transfered')

  // insert org
  const org = {
    id: uuid(),
    name: 'LK'
  }
  org.mCode = mCodeManager._magicCode([org.name])

  await runSql(`insert into org values ('${org.id}','${org.name}', null, '${org.mCode}', null)`)
  console.log('org inserted')

  // tansfer user to member and ticket, magicCode
  const userAry = await runSqlSqlite('select * from user')
  psAry = []
  userAry.forEach(ele => {
    const ticket = {
      id: uuid(),
      memberId: ele.uid,
      startTime: moment(new Date(ele.startTime)).format('YYYY-MM-DD HH:mm:ss'),
      timeout: ele.timeout,
      checkCode: ele.checkCode
    }
    const mCode = mCodeManager._magicCode([ele.name, ele.pic])
    const pic = ele.pic ? `'${ele.pic}'` : null
    const sql = `insert into member values 
    ('${ele.uid}', '${ele.name}', ${pic}, '${org.id}', '${mCode}', null, null, null )`
    const ps = runSql(sql)
    const ticketPs = runSql(`insert into ticket values 
    ('${ticket.id}', '${ticket.memberId}', '${ticket.startTime}', '${ticket.timeout}', ${getField(ticket.checkCode)}, null)`)
    psAry.push(ps)
    psAry.push(ticketPs)
  })

  await Promise.all(psAry)
  console.log('member, ticket, magicCode transfered')

  // insert magicCode
  const memberAry = await runSql(' select * from member where orgId is not null order by id')
  const memberMCode = mCodeManager._magicCode(memberAry.map(ele => ele.mCode))
  const orgMCode = mCodeManager._magicCode([org.mCode])
  await runSql(`insert into magicCode values (1, '${orgMCode}', '${memberMCode}', null)`)
  console.log('insert to magicCode')

  // insert meta
  await runSql(`insert into meta values ('${uuid()}', '1b3231655cebb7a1f783eddf27d254ca', null)`)
  console.log('insert to meta')

  // insert user
  const password = 'admin'
  const user = {
    id: uuid(),
    name: 'admin',
    registerStartTime: formatTime(new Date()),
    registerTimeout: 86400000,
    password: crypto.createHash('md5').update(password).digest('hex')
  }
  const serverConfig = require('../../../config')
  const key = new NodeRSA({b: 512})
  const publicKey = key.exportKey(serverConfig.encrypt.publicKeyFormat)
  const privateKey = key.exportKey(serverConfig.encrypt.privateKeyFormat)

  await executeSql(`insert into user values 
  (?, ?, ?, ?, ?, ?, ?)`,
  [user.id, user.name, user.registerStartTime, user.registerTimeout, user.password, publicKey, privateKey])
  console.log('user admin inserted')

  process.exit(0)
}

function prepare () {
  const sql = `alter table groupMember modify column gid varchar(100);
  alter table groupMember modify column memberId varchar(100);
  alter table groupChat modify column id varchar(100);
  alter table member modify column id varchar(100);
  alter table member modify column pic mediumtext;
  `
  return runSql(sql)
}

function runSql (sql) {
  return new Promise((resolve, reject) => {
    connection.query(sql, (err, results, fields) => {
      if (err) {
        reject(err)
      } else {
        resolve(results)
      }
    })
  })
}

function executeSql (sql, param = []) {
  return new Promise((resolve, reject) => {
    connection.execute(sql, param, (err, results, fields) => {
      if (err) {
        reject(err)
      } else {
        resolve(results)
      }
    })
  })
}

function getField (ele) {
  return ele ? `'${ele}'` : null
}

function runSqlSqlite (sql, param = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, param, (err, rowAry) => {
      if (err) {
        reject(err)
      } else {
        resolve(rowAry)
      }
    })
  })
}

function formatTime (date) {
  return moment(date).format('YYYY-MM-DD HH:mm:ss')
}
