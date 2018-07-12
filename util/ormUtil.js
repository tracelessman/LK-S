let store = require("./store");
const {scvdb,getScvYearDb} = store
let {selectedYearDb} =  store
const {nodeUtil,common,sequelizeUtil,electronUtil} = require('rootPath/self_contained/proxy')
const {getRandomInt,getRandomNumberStr} = common
const Sequelize = require('sequelize')
const uuidV4 = require('uuid/v4')
const  _ = require("lodash")
const randomName = require('chinese-random-name')
const dictService = require('@/store/service/DictService')
const yearService = require('@/store/service/YearService')
const {getRecentYearDb} = yearService
const {dicts} = dictService
const businessUtil = require('@/util/businessUtil')
const magic = businessUtil.getMagicPath()
const {reInitDict} = require('@/store/model/dictionary')

let obj

require('@/store/model/meta').modelSequelized.findOne().then(record=>{
    let content  = record.content
    magic.decrypt(content,content.length)
    content = content.toString().replace('window.hfsyf =','')
    let hfsyf = eval(content)
    obj = hfsyf
})







module.exports = {
    getOrm
}


function getOrm(option={}){
    const {reinit} = option
    function getModelWrapper(model){
        let {key,modelContent,getInstanceFunc,count,init,force,syncCallBack,isEncrypt,
            classification,hasEditor,yearRelated,tableTitle,noRegion,db,exposedObj} = model
        const tableName = 'T_'+common.capitalizeFirst(key)

        const modelObj = {
            id: {
                type: Sequelize.STRING,
                primaryKey:true,
                hiddenFromCheck:true,
            },
            region:{
                dictType:"regionDict",
                title:"来源区域",
                isComputed:true,
                hiddenFromCheck:true,
            },
            ...modelContent,
            extra:{
                type: Sequelize.JSON,
                allowNull:true,
                name:"extra",
                title:"额外信息或者用于改变表结构",
                hiddenFromCheck:true,
            }
        }
        if(noRegion){
            delete modelObj.region
        }
        sequelizeUtil.preProcessModelObj({
            modelObj,
            dicts
        })
        let ministerialKeyAry = ['joinBattleInfo','policy']
        if(ministerialKeyAry.includes(key) ){
            delete modelObj.region
        }

        if(!db){
            db = scvdb
        }
        if(yearRelated && reinit){
            db = getRecentYearDb()
        }


        let modelSequelized = null
        if(!yearRelated || reinit){
            let modelObjParam  = _.cloneDeep(modelObj)
            if(isEncrypt){
                modelObjParam = {
                    id: {
                        type: Sequelize.STRING,
                        primaryKey:true,
                        hiddenFromCheck:true,
                    },
                    extra:{
                        type: Sequelize.JSON,
                        allowNull:true,
                        name:"extra",
                        title:"额外信息或者用于改变表结构",
                        hiddenFromCheck:true,
                    },
                    content:{
                        type: Sequelize.BLOB,
                    }
                }
            }
            modelSequelized = db.define(tableName,modelObjParam, {
                paranoid:false
            })
        }

        sequelizeUtil.addFlag(modelObj,dicts)
        if(!electronUtil.isDev || !reinit){
            force = false
            init = false
        }
        if(!yearRelated || reinit) {
            modelSequelized.sync({
                force

            }).then(function () {
                if (syncCallBack) {
                    syncCallBack({
                        key,
                        modelSequelized,
                        modelObj
                    })
                }
                if (init) {
                    const start = Date.now()
                    console.log('init start')
                    let ary = []
                    for (let i = 0; i < count; i++) {
                        let instance = getInstanceFunc()
                        instance.id = uuidV4()
                        instance.region = ['000000000000']
                        for (let key in modelContent) {
                            const value = instance[key]
                            if (!value) {
                                const fieldObj = modelContent[key]
                                const {computed, dictType, isCascade} = fieldObj
                                if (computed) {
                                    instance[key] = computed(instance)

                                } else if (dictType) {
                                    let certainDict = dicts[dictType]
                                    if (isCascade) {
                                        instance[key] = getRandomValueFromCascade(certainDict)
                                    } else {
                                        if(certainDict.length > 0){
                                            let dictObj = certainDict[getRandomInt(certainDict.length)]
                                            instance[key] = dictObj.value
                                        }

                                    }

                                }

                            }

                        }

                        if(isEncrypt){
                            instance.content = Buffer.from(obj.method2(JSON.stringify(instance)))
                        }
                        ary.push(instance)
                    }
                    modelSequelized.bulkCreate(ary).then(() => {
                        console.log('init end')
                        let interval = Date.now() - start
                        console.log(`time interval: ${interval / 1000} s`)
                    }).catch(err => {
                        console.log(err)
                    })

                }
            });

        }
        return {
            isEncrypt,
            modelObj,
            modelSequelized,
            classification,
            hasEditor,
            tableTitle,
            tableName,
            exposedObj
        }
    }

    let result = {}
    const modelAry = [
        require('@/store/model/appModel'),
        require('@/store/model/armyType'),
        require('@/store/model/identityVerifyRecord'),

        require('@/store/model/importRecord'),
        require('@/store/model/meta'),

        require('@/store/model/joinBattleInfo'),
        require('@/store/model/policyModel'),
        require('@/store/model/tableContent'),
    ]

    for(let model of modelAry){
        let {key} = model
        result[key] = getModelWrapper(model)
    }
    return result
}



function getRandomValueFromCascade(dict){
    let result = []
    while(true){
        dict = dict[getRandomInt(dict.length)]

        if(dict.hasOwnProperty('children')){
            result.push(dict.value)
            dict = dict.children
        }else{
            result.push(dict.value)
            break
        }
    }

    return result
}







const ormUtil = {

}

module.exports = ormUtil
