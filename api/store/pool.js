const mysql = require('mysql2')
const config = require('../../config')

const option = {
    connectionLimit : 5,
    host            : 'localhost',
    user            : config.db.username,
    password        : config.db.password
}
const pool  = mysql.createPool(option);


module.exports = pool
