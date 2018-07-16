

const iviewUtil = require('../../frontend/util/iviewUtil')
const businessUtil = {
    getLabel(item,modelObj){
        let field = modelObj[item]

        let title = field.title
        if(!title){
            title = ''
        }

        let result = title.length === 2?title[0]+"&emsp;&emsp;&nbsp;&nbsp;"+title[1]:title
        return result+":"
    },
    rawDataDisplay(ele,modelObj){
        ele = _.cloneDeep(ele)
        function tem(dateStr){
            if(dateStr){
                let date = new Date(dateStr)
                return iviewUtil.local(date)
            }else{
                return ''
            }
        }

        for (let key in ele) {
            let attr = modelObj[key]
            if (attr) {
                let {dictType, isCascade, isDateFormat,isTimeFormat,isArray,isDateRange} = attr

                let value = ele[key]
                if (value) {
                    if (dictType) {
                        if (isCascade) {
                            ele[key] = dictService.getLabel2(dictType, value)
                        } else {
                            ele[key] = dictService.getLabelSingle2(dictType, value)
                        }
                    } else if (isDateFormat) {
                        ele[key] = iviewUtil.local(value)
                    }else if(isTimeFormat){

                        ele[key] = iviewUtil.local(value,true)
                    }else if(isArray){
                        //todo need check
                        if(typeof value ==='string'){
                            console.log(value)
                            console.log(key)
                            console.log('should be array,not string')
                            value = JSON.parse(value)

                        }

                        if(isDateRange){
                            ele[key] = `${tem(value[0])}   ${other.dateRangeSeparator}   ${tem(value[1])}`
                        }else{
                            ele[key] = value.join(',')
                        }
                    }
                }else{
                    ele[key] = "--"
                }
            }
        }
        return ele
    },
}

Object.freeze(businessUtil)
export default businessUtil
