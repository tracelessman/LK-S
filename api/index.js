const express = require('express')
const session = require('express-session')
const bodyParser = require('body-parser')

const app = express()
app.use(bodyParser.json())
app.use(session({
    secret: 'keyboard cat',
    resave: true,
    saveUninitialized:true,
    cookie: { maxAge:1000*60*60 }
}))

// Require API routes
const users = require('./routes/users')

// Import API Routes
app.use('/user',users)

// Export the server middleware
module.exports = {
  path: '/api',
  handler: app
}
