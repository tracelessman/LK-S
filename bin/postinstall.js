const {ModuleUtil} = require('@ys/collection')
const {installGit} = ModuleUtil
const path = require('path')
const rootPath = path.resolve(__dirname, '../')

installGit(rootPath)
