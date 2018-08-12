const {ormServicePromise} = require('../store/ormService')
const crypto = require('crypto')



const codeUtil = {
    //id 排序,id在一起hash
    async getOrgMcode(org){
        const ormService = await ormServicePromise
        const recordAry = ormService.org.getAllRecords()
        const idAry = recordAry.map(ele=>{
            return ele.id
        })
        idAry.sort()
        const mCode = crypto.createHash('md5').update(idAry.join(''))


        return mCode
    },
    //id排序 ,id在一起hash
    async getOrgMemberMCode(org){
        const ormService = await ormServicePromise
        const recordAry = ormService.member.getAllRecords()
        const idAry = recordAry.map(ele=>{
            return ele.id
        })
        idAry.sort()
        const mCode = crypto.createHash('md5').update(idAry.join(''))


        return mCode
    },
    //
}

Object.freeze(codeUtil)
module.exports = codeUtil
