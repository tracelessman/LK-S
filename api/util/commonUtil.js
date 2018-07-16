const fse = require('fs-extra')

const commonUtil = {
    getTimeDisplay: function () {
        const date = new Date();
        return `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
    },
    runFunc(func,option){
        if(func){
            func(option)
            return true
        }
    },
    debounceFunc(func,interval = 1000*2){
        return _.throttle(func,interval,{
            leading:true,
            trailing:false
        })
    },
    objectify(obj){
        return obj?obj:{}
    },
    ensureDirMultipleSync(...ary){
        for(let ele of ary){
            fse.ensureDirSync(ele)
        }
    },
    capitalizeFirst(str,deCapitalize){
        let first = str.charAt(0)
        first = deCapitalize?first.toLowerCase():first.toUpperCase()

        return first+str.substring(1)

    },
    //没有side effect
    deleteFromAry(option){
        const defaultOption = {
            global:false
        }
        option = {
            ...defaultOption,
            ...option
        }
        const {ary,ele,global} = option
        const _ary = _.cloneDeep(ary)
        if(_ary.includes(ele)){
            _ary.splice(_ary.indexOf(ele),1)
        }
        if(global){
            while(_ary.includes(ele)){
                _ary.splice(_ary.indexOf(ele),1)
            }
        }
        return _ary
    }
}

module.exports = commonUtil
