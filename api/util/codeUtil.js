const path = require('path')
const rootPath = path.resolve(__dirname,'../../')


const {ormServicePromise} = require(path.resolve(rootPath,'api/store/ormService'))

const crypto = require('crypto')



const codeUtil = {
    //id 排序,id在一起hash
    async getOrgMcode(org){
        const ormService = await ormServicePromise
        let recordAry
        try{
            recordAry = await ormService.org.getAllRecords()

        }catch(err){
            console.log(err)

        }

        const idAry = recordAry.map(ele=>{
            return ele.id
        })
        idAry.sort()
        const mCode = crypto.createHash('md5').update(idAry.join('')).digest('hex')


        return mCode
    },
    //id排序 ,id在一起hash
    async getOrgMemberMCode(org){
        const ormService = await ormServicePromise
        const recordAry = await ormService.member.getAllRecords()
        const idAry = recordAry.map(ele=>{
            return ele.id
        })
        idAry.sort()
        const mCode = crypto.createHash('md5').update(idAry.join('')).digest('hex')


        return mCode
    },
    //
    async getMemberMCode(){
        return ''
    }
}

Object.freeze(codeUtil)
module.exports = codeUtil
