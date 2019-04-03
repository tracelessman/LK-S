const mysql = require('mysql2')
const config = require('../../config')
const {ormModelPromise} = require('./ormModel')

const option = {
    connectionLimit : 5,
    host            : 'localhost',
    user            : config.db.username,
    password        : config.db.password
}
const pool  = mysql.createPool(option);

createView()

async function createView() {
  const ormModel = await ormModelPromise
  const psAry = []
  for(let ele in ormModel) {
    const {modelSequelized} = ormModel[ele]

    psAry.push(modelSequelized.sync())
  }
  await Promise.all(psAry)
  // drop and create view
}

module.exports = pool
