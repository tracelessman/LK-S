
function addCommonSetting(columns,commonSetting,excludeFunc = (column)=>{
    return (column.key === 'action' || column.type)
}){
    for(let column of columns){
        if(excludeFunc(column)){
            continue
        }
        for(let setting in commonSetting)
            column[setting] = commonSetting[setting]
    }
    return columns
}

function parseDate(dateS){
    let ary = dateS.split('-')
    return new Date(parseInt(ary[0]),parseInt(ary[1])-1,parseInt(ary[2]))
}

const commonSettingV1 = {
    sortable: true,
    align:"center"
}

function notNullValidation(option){
    return new Promise((resolve,reject)=>{
        const {validationAry,valueObj,_this,modelObj} = option
        for(let ele of validationAry){
            const value = valueObj[ele]
            const fieldObj = modelObj[ele]
            if(!value){
                info({_this,content:`${fieldObj.title}字段不能为空,请补充完整`})
                focus(_this,ele)
                return
            }else{
                const {validateFunc} = fieldObj
                if(validateFunc){
                    let resultValidate = validateFunc(valueObj)
                    if(!resultValidate.valid){
                        info({_this,content:resultValidate.errorMsg})
                        focus(_this,ele)
                        return
                    }
                }
            }
        }
        resolve(validationAry)
    })

}

function notNullAndUniqueValidation(option){
    return new Promise((resolve,reject)=>{
        const {validationAry,valueObj,_this,modelObj,service} = option
        for(let ele of validationAry){
            const value = valueObj[ele]
            const fieldObj = modelObj[ele]
            if(!value){
                info({_this,content:`${fieldObj.title}字段不能为空,请补充完整`})
                focus(_this,ele)
                return
            }else{
                const {validateFunc} = fieldObj
                if(validateFunc){
                    let resultValidate = validateFunc(valueObj)
                    if(!resultValidate.valid){
                        info({_this,content:resultValidate.errorMsg})
                        focus(_this,ele)
                        return
                    }
                }
            }
        }

        let promiseAry = []
        for(let key in valueObj){
            const fieldObj = modelObj[key]
            if(!fieldObj){
                continue
            }
            const value = valueObj[key]
            const {unique} = fieldObj
            if(unique && value){
                let where = {}
                where[key] = value
                let promise = service.queryExact(where)
                promise.key = key
                promiseAry.push(promise)
            }
        }
        Promise.all(promiseAry).then(resultAry=> {
            for (let i = 0; i < resultAry.length; i++) {
                if (resultAry[i].length > 0) {
                    info({_this,content:`${modelObj[promiseAry[i].key].title}有重复记录, 请重新输入`})
                    focus(_this, promiseAry[i].key)
                    return
                }
            }
            resolve(resultAry)
        })


    })


}

module.exports = {
    addCommonSetting,
    commonSettingV1,
    info,
    initValueRecordSave(param){
        const {modelObj} = param
        let result = {}
        for(let key in modelObj){
            const {isCascade,isDouble,isInteger,isDateRange,isArray} = modelObj[key]

            if(isArray){
                if(isDateRange){
                    result[key] = [null,null]
                }else{
                    result[key] = []
                }
            }else if(isDouble || isInteger){
                result[key] = null
            }

        }
        return result
    },
    focus,
    local(date,isTimeFormat){
        let str = ''
        if(!(date instanceof Date)){
            date = new Date(date)
        }


        if(isTimeFormat){
            str = ` ${padding(date.getHours())}:${padding(date.getMinutes())}:${padding(date.getSeconds())}`
        }

        return `${date.getFullYear()}-${padding(date.getMonth()+1)}-${padding(date.getDate())}${str}`
    },
    parseDate,
    getCertainFields(modelObj,excludeAry = [],option = {
        noHiddenFromCheck:true
    }){
        let ary = []
        excludeAry = excludeAry.concat(['id','extra'])
        for(let key in modelObj){
            if(!excludeAry.includes(key)){
                if(option.noHiddenFromCheck && modelObj[key].hiddenFromCheck){
                }else{
                    ary.push(key)
                }
            }
        }
        return ary
    },
    notNullValidation,
    notNullAndUniqueValidation,
    passValidation(param){
        let {modelObj,valueObj,_this,fieldAry,classification,tabsValueName} = param
        if(!tabsValueName){
            tabsValueName = 'tabsValue'
        }
        if(!fieldAry){
            fieldAry = Object.keys(modelObj)
        }
        let pass = true
        for(let field of fieldAry){
            let  fieldObj = modelObj[field]
            let value = valueObj[field]
            if(fieldObj.hasOwnProperty('allowNull') && !fieldObj.allowNull && !value && !fieldObj.isComputed){
                if(classification){
                    for(let key in classification){
                        if(classification[key].keys.includes(field)){
                            _this[tabsValueName] = key
                            break
                        }
                    }
                }
                info({_this,content:`${fieldObj.title}字段不能为空,请补充完整`,})
                focus(_this,field)
                pass = false
                break
            }
            if(value){
                const {validateFunc} = fieldObj
                if(validateFunc){
                    let resultValidate = validateFunc(valueObj)
                    if(!resultValidate.valid){
                        pass = false
                        info({_this,content:resultValidate.errorMsg})
                        focus(_this,field)
                        break
                    }
                }
            }

        }

        return pass
    },
    getDatePickerOptions(field,valueObj,modelObj){
        const fieldObj = modelObj[field]

        let disabledDate = (date)=>{
            let notInFutureCondition = false
            let relationCondition = false
            if(fieldObj.notInFuture){
                notInFutureCondition = date.getTime() > Date.now()
            }
            const {relation} = fieldObj
            if(relation){
                const {relatedField,operator} = relation
                let relatedFieldValue = valueObj[relatedField]

                if(relatedFieldValue){
                    if(typeof relatedFieldValue === 'string'){
                        relatedFieldValue = new Date(relatedFieldValue)
                    }
                    relationCondition = eval(`${date.getTime()} ${operator} ${relatedFieldValue.getTime()}`)
                }
            }
            return notInFutureCondition || relationCondition
        }

        return {
            disabledDate
        }
    }
}

function focus(_this,field){
    let component = _this.$refs[field]

    if(component){

        if(component instanceof Array){
            component = component[0]
        }
        if(component && component.focus){
            component.focus()
        }
    }
}

function padding(target){

    target = target+''

    let result = target
    if(target.length === 1){
        result = '0'+target
    }
    return result
}

function info(option){
    const {_this,content} = option
    _this.$Message.info({
        content,
        duration:3
    })

}
