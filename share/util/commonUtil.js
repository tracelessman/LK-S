
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
    capitalizeFirst(str,deCapitalize){
        let first = str.charAt(0)
        first = deCapitalize?first.toLowerCase():first.toUpperCase()

        return first+str.substring(1)

    }
}

module.exports = commonUtil
