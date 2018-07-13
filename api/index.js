const express = require('express')
const session = require('express-session')
const bodyParser = require('body-parser')


//初始化数据库连接
require('./store')

const app = express()
app.use(bodyParser.json())
app.use(session({
    secret: 'keyboard cat',
    resave: true,
    saveUninitialized:true,
    cookie: { maxAge:1000*60*60 }
}))

// Require API routes
const user = require('./routes/user')
const test = require('./routes/test')

// Import API Routes
app.use('/user',user)
app.use('/test',test)

// Export the server middleware
module.exports = {
  path: '/api',
  handler: app
}
