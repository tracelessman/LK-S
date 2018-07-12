const path = require('path')
const rootPath = path.resolve(__dirname,'../../')
const storeUtil = require(path.resolve(rootPath,'util/storeUtil'))
const localFolder = path.resolve(rootPath,'local')
const config = require(path.resolve(rootPath,'config'))
const tmpFolder = path.resolve(localFolder,'tmp')
const util = require(path.resolve(rootPath,'util'))
util.ensureDirMultipleSync(localFolder,tmpFolder)

const option = {
    ...config.db,
    metaDatabase:'testMetaDb',
    mainDatabase:'testMainDb',
}

storeUtil.setDb(option).then(mainDb=>{
    console.log(mainDb)

})
// test('setDb', () => {
//
//
// });
