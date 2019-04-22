const sqlite3 = require('sqlite3')
const mysql = require('mysql2')
const uuid = require('uuid')

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

  //insert org
  const org = {
    id: uuid(),
    name: 'LK'
  }

  // tansfer user to member
  const userAry = await runSqlSqlite('select * from user')
  psAry = []
  userAry.forEach(ele => {
    const sql = `insert into member values ('${ele.uid}', '${ele.name}', '${ele.pic}' )`
    const ps = runSql(sql)
    psAry.push(ps)

  })
}

function prepare() {
  const sql = `alter table groupMember modify column gid varchar(100);
  alter table groupMember modify column memberId varchar(100);
  alter table groupChat modify column id varchar(100);
  alter table member modify column id varchar(100);
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
