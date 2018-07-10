const Sequelize = require('sequelize')
const uuidV4 = require('uuid/v4')


const key = 'admin'

const count = 88
let init = true
// init = false
let force = true
// force = false
const tableTitle = '管理员管理'


module.exports = {
    count,
    exposedObj:{
        addRecordCb(option){
            initArmyTypeDict(option)
        },
        deleteRecordCb(option){
            initArmyTypeDict(option)
        },
        updateRecordCb(option){
            initArmyTypeDict(option)
        },
        deleteRecordBeforePromise(option){
            const storeUtil = require('@/store/util')
            return new Promise((resolve,reject)=>{
                const {ormModel,record} = option
                const {id} = record
                ormModel.joinBattleInfo.modelSequelized.findAll().then(recordAry=>{
                    storeUtil.getObj().then(obj=>{
                        for(let recordJoinBattle of recordAry){
                            let {content} =  recordJoinBattle
                            content = JSON.parse(obj.method2r(content.toString()))
                            if(content.armyType === id){
                                reject(`该兵种"${record.content}"已经在参战信息表中被使用,不可再被删除!`)

                            }
                        }

                        resolve(record)
                    })

                })

            })

        },
    },
    force,
    getInstanceFunc(){
        let startYear = 1979 + getRandomInt(20)
        let endYear = startYear + getRandomInt(20)
        let jun = getRandomInt(30,1)
        let shi = getRandomInt(50,1)
        let tuan = getRandomInt(150,1)
        return {
            content:`${getRandomNumberStr(6)}特种部队`,
        }
    },
    init,
    key,
    modelContent:{
        content:{
            allowNull:false,
            unique:true,
            title:'兵种名',
        },
    },
    tableTitle,
    syncCallBack(param){
        initArmyTypeDict(param)
    },

}


