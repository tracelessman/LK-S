const assert = require('assert')

const objectUtil = {
    insureAllKey(obj,option = {}){
        assert(typeof obj === 'object')
        assert(typeof option === 'object')
        const assertOption = option.assert
        const f = (obj)=>{
            for(let key of obj){
                const value = obj[key]
                if(value === undefined){
                    return false
                }else{
                    if(typeof value === 'object'){
                        const subResult = f(value)
                        if(!subResult){
                            return false
                        }
                    }
                }
            }
            return true
        }
        const result = f(obj)
        if(assertOption){
            assert(result)
        }
        return result
    }
}

Object.freeze(objectUtil)
module.exports = objectUtil
