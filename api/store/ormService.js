const Sequelize =  require('sequelize')
const uuidV4 = require('uuid/v4')
const fs = require('fs')
const fse = require('fs-extra')
const path = require('path')
const Op = Sequelize.Op;
const {ormModelPromise} = require('./ormModel')
const _ = require('lodash')
const rootPath = path.resolve(__dirname,'../../')


const util = require(path.resolve(rootPath,'api/util'))
const ormServicePromise = ormModelPromise.then((ormModel)=>{
    const option = {
        ormModel
    }
    return util.getOrmService(option)
})
module.exports = {
    ormServicePromise
}

