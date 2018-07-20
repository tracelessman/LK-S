const store = require("./index");
const Sequelize = require('sequelize')
const uuidV4 = require('uuid/v4')
const  _ = require("lodash")
const path = require('path')
const rootPath = path.resolve(__dirname,'../../')
const {mainDbPromise} = require(path.resolve(rootPath,'api/store'))

const dict = require(path.resolve(rootPath,'business/dict'))
const util = require(path.resolve(rootPath,'api/util'))


const ormModelPromise = mainDbPromise.then(mainDb=>{
    const option = {
        modelAry:[
            require(path.resolve(rootPath,'api/store/model/user')),
            require(path.resolve(rootPath,'api/store/model/meta'))
        ],
        dict,
        database:mainDb
    }
    const orm = util.getOrmModel(option)
    return orm
})





module.exports = {
    ormModelPromise
}




