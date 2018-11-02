const {upload} = require('./util')
const path = require('path')
const rootPath = path.resolve(__dirname, '../')
const config = require(path.resolve(rootPath, 'config'))
const {serverRoot, updateJsonPath} = config

upload({remote: path.resolve(serverRoot, updateJsonPath), local: path.resolve(rootPath, updateJsonPath)})
