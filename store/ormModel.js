const store = require("./index");
const Sequelize = require('sequelize')
const uuidV4 = require('uuid/v4')
const  _ = require("lodash")
const path = require('path')
const rootPath = path.resolve(__dirname,'../')
const {mainDbPromise} = require('./index')

const dict = require(path.resolve(rootPath,'business/dict'))
const util = require(path.resolve(rootPath,'util'))


const ormModelPromise = mainDbPromise.then(mainDb=>{
    const option = {
        modelAry:[require(path.resolve(rootPath,'store/model/user'))],
        dict,
        database:mainDb
    }
    const orm = util.getOrmModel()
    return orm
})





module.exports = {
    ormModelPromise
}




