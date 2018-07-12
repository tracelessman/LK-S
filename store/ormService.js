const {nodeUtil,sequelizeUtil} = require("rootPath/self_contained/proxy")
const Sequelize =  require('sequelize')
const uuidV4 = require('uuid/v4')
const fs = require('fs')
const fse = require('fs-extra')
const path = require('path')
const Op = Sequelize.Op;
const ormModel = require('@/store/ormModel')
const businessUtil = require('@/util/businessUtil')
const logger = require('rootPath/src/logger').getLogger('ormService','render')
const _ = require('lodash')
const storeUtil = require('@/store/util')

let obj

storeUtil.getObj().then((result)=>{
    obj = result
})

const ormService = {}
const ary = [
    require('./service/policyService'),
    require('./service/appService'),
    require('./service/identityVerifyRecordService'),
]

for(let item of ary){
    ormService[item.key] = item
}
const keys = [
    'app',
    'identityVerifyRecord',
    'meta',
    'joinBattleInfo',
    'policy',
    'armyType',
    'importRecord'
]
for(let key of keys){
    const {modelObj,hasEditor,exposedObj,isEncrypt} = ormModel[key]

    if(!ormService[key]){
        ormService[key] = {}
    }

    function compare(record,queryCondition){
        let result = true
        for(let keyInqueryCondition in queryCondition){
            if(!record[keyInqueryCondition] || !queryCondition[keyInqueryCondition]){
                result = false
                break
            }
            const isSame = JSON.stringify(queryCondition[keyInqueryCondition]).trim() !== JSON.stringify(record[keyInqueryCondition]).trim()
            if(isSame){
                result = false
                break
            }
        }

        return result
    }
    function  queryExact(queryCondition){
        return new Promise(resolve=>{
            if(isEncrypt){
               ormModel[key].modelSequelized.findAll({
                    order:sequelizeUtil.defaultOrder
                }).then(recordAry=>{
                    let result = []
                   for(let ele of recordAry){
                       let {content} = ele
                       content = JSON.parse(obj.method2r(content.toString()))
                       ele = {
                           ...ele.dataValues,
                           ...content
                       }
                      if(compare(ele,queryCondition)){
                          result.push(ele)
                      }
                   }
                   resolve(result)
                })
            }else{
                ormModel[key].modelSequelized.findAll({
                    where:queryCondition,
                    order:sequelizeUtil.defaultOrder
                }).then(result=>{
                    resolve(result)
                })
            }
        })
    }
    function addRecord(record){
        preProcess(record,modelObj)
        if(isEncrypt){
            record.content = Buffer.from(obj.method2(JSON.stringify(record)))
        }
        if(!record.id){
            record.id = uuidV4()
        }
        const {documentData,documentId} = record

        return new Promise((res,rej)=>{
            function  _addRecord(record){
                const documentFolder = businessUtil.getDocumentFolderPath()
                try{
                    if(documentData){
                        fs.writeFileSync(businessUtil.getHtmlPath(documentId),documentData)
                    }
                    ormModel[key].modelSequelized.create(record).then(recordCreated => {
                        res(recordCreated)
                        if(exposedObj&&exposedObj.addRecordCb){
                            exposedObj.addRecordCb({
                                modelObj,
                                modelSequelized:ormModel[key].modelSequelized
                            })
                        }
                    }).catch(err=>{
                        console.log(err)
                        rej(err)
                    })
                }catch(err){
                    fse.remove(path.resolve(documentFolder,`${record.documentId}`),(err)=>{
                        if(err){
                            console.log(err)
                        }
                    })
                    console.log(err)
                    logger.error(`${key}-addRecord 出现错误,err: ${err.toString()}`)
                    rej(err)
                }

            }
            try{

                if(key !== 'app' ){
                    if(!record.region || record.region.length === 0){
                        ormService.app.getApp().then(appGlobal=>{
                            record.region = appGlobal.region
                            _addRecord(record)
                        })
                    }else{
                        _addRecord(record)
                    }
                }else{
                    _addRecord(record)
                }
            }catch(err){
                logger.error(`${key}-addRecord 出现错误,err: ${err.toString()}`)
                console.log(err)
                rej(err)
            }

        })
    }

    function deleteRecord(record){
        return  new Promise((resolve,reject)=>{
            if(exposedObj && exposedObj.deleteRecordBeforePromise){
                exposedObj.deleteRecordBeforePromise({
                    ormModel,record
                }).then(()=>{
                    _deleteRecord()
                }).catch(err=>{
                    reject(err)
                })
            }else{
                _deleteRecord()
            }

            function _deleteRecord(){
                ormModel[key].modelSequelized.destroy({
                    where:{
                        id:record.id
                    }
                }).then(result=>{
                    resolve(result)
                    if(exposedObj&&exposedObj.deleteRecordCb){
                        exposedObj.deleteRecordCb({
                            modelObj,
                            modelSequelized:ormModel[key].modelSequelized
                        })
                    }
                })
            }

        })
    }
    init()

    function queryByCondition(queryCondition){
        if(isEncrypt){
            return queryByConditionEncrypt(queryCondition)
        }else{
            return queryByConditionNotEncrypt(queryCondition)
        }
    }

    function queryByConditionEncrypt(queryCondition){
            return new Promise((resolve,reject)=>{
                ormModel[key].modelSequelized.findAll({
                    order:sequelizeUtil.defaultOrder
                }).then(records=>{
                    records = records.map(ele=>{
                        ele = ele.dataValues
                        let {content} = ele
                        content = JSON.parse(obj.method2r(content.toString()))
                        ele = {
                            ...ele,
                            ...content
                        }
                        return ele
                    })

                    records = records.filter(ele=>{
                        let result = true


                        for(let key in queryCondition){
                            const valueQuery = queryCondition[key]

                            if(notNullCondition(valueQuery)){
                                let condition
                                const valueContent = ele[key]
                                if(!notNullCondition(valueContent)){
                                    condition = false
                                }else{
                                    const fieldObj = modelObj[key]
                                    const {isCascade,isInteger,isDouble,isTimeFormat,isDateFormat,isArray,dictType,isDateRange} = fieldObj

                                    if(isInteger || (dictType&&!isCascade) || isDouble ){
                                        condition = valueQuery === valueContent
                                    }
                                    if(dictType && isCascade){
                                        condition = valueQuery.join('') === valueContent.join('')
                                    }
                                    if(isArray && !isDateRange && !isCascade){
                                        condition = valueContent.join('@#').includes(valueQuery)
                                    }
                                    if(isTimeFormat || isDateFormat){
                                        condition = true
                                        const valueContentObj = new Date(valueContent)
                                        if(valueQuery[0]){
                                            condition = condition && valueQuery[0].getTime() <= valueContentObj.getTime()
                                        }
                                        if(valueQuery[1]){
                                            condition = condition && valueQuery[1].getTime() >= valueContentObj.getTime()
                                        }
                                    }
                                    if(isDateRange){
                                        condition = true
                                        if(valueQuery[0]){
                                            if(valueContent[0]){
                                                condition = condition && valueQuery[0].getTime() <= new Date(valueContent[0]).getTime()
                                            }else{
                                                condition = false
                                            }
                                        }
                                        if(valueQuery[1]){
                                            if(valueContent[1]){
                                                condition = condition && valueQuery[1].getTime() >= new Date(valueContent[1]).getTime()
                                            }else{
                                                condition = false
                                            }
                                        }
                                    }


                                }


                                if(condition === undefined){
                                    condition = valueContent.includes(valueQuery)
                                }
                                result = result && condition
                            }
                        }
                        return result
                    })
                    resolve(records)
                })
            })
    }

    function notNullCondition(value){
        let result = value && !Array.isArray(value)
        result = result || (value && Array.isArray(value) && (value[0]||value[1]))

        return result
    }
    function queryByConditionNotEncrypt(queryCondition){
        let where = {}
        for(let key in queryCondition){
            let value = queryCondition[key]
            if(value){
                let fieldObj = modelObj[key]
                const {isCascade,isInteger,isDouble} = fieldObj
                if(fieldObj.isDateFormat || fieldObj.isTimeFormat){
                    let valueTemp = _.cloneDeep(value)

                    if(valueTemp[0] && valueTemp[1]){
                        if(typeof valueTemp[0] === 'object'){
                            valueTemp[1] = new Date(valueTemp[1].getFullYear(),valueTemp[1].getMonth(),valueTemp[1].getDate()+1)
                        }else{
                            console.log('in query condition value of date format is string')
                        }
                        where[key] = {
                            [Op.between]:valueTemp
                        }
                    }else if(!valueTemp[0] && valueTemp[1]){
                        valueTemp[1] = new Date(valueTemp[1].getFullYear(),valueTemp[1].getMonth(),valueTemp[1].getDate()+1)
                        where[key] = {
                            [Op.lte]:valueTemp[1]
                        }
                    }else if(valueTemp[0] && !valueTemp[1]){
                        where[key] = {
                            [Op.gte]:valueTemp[0]
                        }
                    }
                }else if(fieldObj.dictType && !isCascade || isInteger) {
                    where[key] = value
                }else if(isDouble){
                    let intVal = parseInt(value)
                    where[key] = {
                        [Op.between]:[intVal,intVal+1]
                    }
                }else if(!fieldObj.isArray){
                    where[key] = {
                        [Op.like]:`%${value}%`
                    }
                }
            }
        }


        return new Promise((resolve,reject)=>{
            ormModel[key].modelSequelized.findAll({
                where,
                order:sequelizeUtil.defaultOrder
            }).then(records=>{
                for(let key in queryCondition) {
                    let value = queryCondition[key]
                    if (value) {
                        let fieldObj = modelObj[key]
                        const {isArray,isDateRange,isCascade} = fieldObj
                        if(isArray){
                            if(isDateRange){
                                records = records.filter((record)=>{
                                    let timeRangeAry = record[key]
                                    if(typeof timeRangeAry === 'string'){
                                        timeRangeAry = JSON.parse(timeRangeAry)
                                        console.log(timeRangeAry)
                                        console.log(key)
                                        console.log('should be array,not string')
                                    }


                                    let condition1 = true
                                    let condition2 = true
                                    if(value[0]){
                                        condition1 = new Date(timeRangeAry[0]).getTime() >= value[0].getTime()
                                    }
                                    if(value[1]){
                                        condition2 = new Date(timeRangeAry[1]).getTime() <= value[1].getTime()
                                    }
                                    return  condition1 && condition2

                                })
                            }else if(isCascade && value.length > 0){
                                records = records.filter((record)=>{
                                    let valTem = record[key]
                                    return valTem.join(',') === value.join(',')
                                })
                            }else{
                                records = records.filter((record)=>{
                                    let valTem = record[key]
                                    return valTem.join(',').includes(value)
                                })
                            }
                        }
                    }
                }
                resolve(records)
            })
        })
    }

    function init(){
        ormService[key] = {
            ...ormService[key],
            addRecord,
            addRecordMultiple(recordAry){
                let promiseAry = []
                for(let record of recordAry){
                    promiseAry.push(addRecord(record))
                }
                return Promise.all(promiseAry)
            },
            deleteRecord,
            deleteRecordMultiple(ary){
                let promises = []
                for(let record of ary){
                    let promise = deleteRecord(record)
                    promises.push(promise)
                }

                return new Promise((res,rej)=>{
                    const logInfo = ary.map((obj)=>{return JSON.stringify(obj)}).toString()
                    let values,err
                    try{
                        Promise.all(promises).then(result=>{
                            res(result)
                            if(exposedObj && exposedObj.deleteCb){
                                for(let record of ary){
                                    exposedObj.deleteCb(record)
                                }
                            }
                        }).catch(err=>{
                            rej(err)
                        })
                        if(hasEditor){
                            for(let record of ary){
                                const {documentId} = record
                                fse.removeSync(businessUtil.getIdFolderPath(documentId))
                            }
                        }
                    }catch(error){
                        err = error
                        logger.error(`删除${promises.length}条记录失败,记录分别为2 ${logInfo}`)
                    }
                })
            },
            getAllRecords(){
                return new Promise(resolve => {
                    if(ormModel[key].modelSequelized){
                        ormModel[key].modelSequelized.findAll({
                                order:sequelizeUtil.defaultOrder
                            }
                        ).then(result=>{
                            if(isEncrypt){
                                for(let i=0;i<result.length;i++){
                                    let ele = result[i].dataValues
                                    let {content} = ele
                                    content = JSON.parse(obj.method2r(content.toString()))
                                    ele = {
                                        ...content,
                                        ...ele
                                    }
                                    delete ele.content
                                    result[i] = ele
                                }
                                resolve(result)
                            }else{
                                resolve(result)
                            }

                        })
                    }else{
                        resolve([])
                    }

                })

            },
            queryByCondition,
            queryExact,
            updateRecord(record){

                preProcess(record,modelObj)
                if(isEncrypt){
                    record.content = Buffer.from(obj.method2(JSON.stringify(record)))

                }

                return new Promise((resolve,reject)=>{
                    try{
                        if(hasEditor){
                            const {documentData} = record
                            fs.writeFileSync(businessUtil.getHtmlPath(record.documentId),documentData)
                        }
                        ormModel[key].modelSequelized.update(record,{
                            where:{
                                id:record.id
                            }
                        }).then(result=>{

                            resolve(result)
                            if(exposedObj&&exposedObj.updateRecordCb){
                                exposedObj.updateRecordCb({
                                    modelObj,
                                    modelSequelized:ormModel[key].modelSequelized
                                })
                            }

                        })
                    }catch(err){
                        console.log(err)
                        reject(err)
                    }

                })
            },
            updateRecordById(record,id){
                if(!id && record.id){
                    id = record.id
                }
                preProcess(record,modelObj)
                return ormModel[key].modelSequelized.update(record,{
                    where:{
                        id
                    }
                })
            }
        }
    }


}

function preProcess(record,modelObj){
    for(let key in modelObj){
        let value = record[key]
        if(modelObj.hasOwnProperty(key)){
            const fieldObj = modelObj[key]
            if(!value){
                if(fieldObj.isDateFormat || fieldObj.isTimeFormat ){
                    record[key] = null
                }
            }
            const {computed} = fieldObj
            if(computed){
                record[key] = computed(record)
            }
        }
    }
}

module.exports = ormService

