

const Sequelize = require('sequelize')
const commonUtil = require('./commonUtil')


const excludeAryBase = ['deletedAt','updatedAt','createdAt','id','extra']


module.exports = {
    excludeAryBase,
    defaultOrder:[
        ["createdAt","DESC"]
    ],
    preProcessModelObj(param){
        const {modelObj,dict} = param
        for(let key in modelObj){
            const {dictType,computed,primaryKey,isArray} = modelObj[key]
            if(dictType){
                if(dict[dictType].isCascade){
                    modelObj[key].isCascade = true
                    modelObj[key].isArray = true
                    modelObj[key].type = Sequelize.JSON
                }else{
                    modelObj[key].type = Sequelize.STRING
                }
            }
            if(isArray){
                modelObj[key].type = Sequelize.JSON
            }
            if(computed){
                modelObj[key].isComputed = true
            }
            if(!modelObj[key].type){
                modelObj[key].type = Sequelize.STRING
            }
        }
        for(let key in modelObj ){
            const value = modelObj[key]

            //处理displayPage
            if(!value.hasOwnProperty('displayPage')){
                modelObj[key].displayPage = ['create','modify','check']
            }
            if(modelObj[key].isComputed){
                modelObj[key].displayPage = commonUtil.deleteFromAry({
                    ary:modelObj[key].displayPage,
                    ele:"create"
                })
            }
            let typeStr = modelObj[key].type.name
            if(typeStr === 'DATEONLY'){
                modelObj[key].isDateFormat = true
            }else if(typeStr === 'DATE'){
                modelObj[key].isTimeFormat = true
            }else if(typeStr === 'TEXT'){
                modelObj[key].isTextArea = true
            }else if(typeStr === 'JSONTYPE'){
                modelObj[key].isJSON = true
            }else if(typeStr === 'INTEGER'){
                modelObj[key].isInteger = true
            }else if(typeStr === 'DOUBLE'){
                modelObj[key].isDouble = true
            }
        }
    }


}
