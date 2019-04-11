const path = require('path')
const rootPath = path.resolve(__dirname,'')
const localFolder = path.resolve(rootPath,'local')
const coverageFolder = path.resolve(localFolder,'coverage')
const fse = require('fs-extra')
fse.ensureDirSync(localFolder)
fse.ensureDirSync(coverageFolder)


module.exports = {
    bail: true,
    collectCoverage:true,
    coverageDirectory:coverageFolder
}
