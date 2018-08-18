const path = require('path')
const {ormModelPromise} = require('./ormModel')
const rootPath = path.resolve(__dirname,'../../')


const util = require(path.resolve(rootPath,'api/util'))
const ormServicePromise = ormModelPromise.then((ormModel)=>{
    const option = {
        ormModel
    }
    return util.getOrmService(option)
})
module.exports = {
    ormServicePromise,
}

