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

    }
}

module.exports = commonUtil
