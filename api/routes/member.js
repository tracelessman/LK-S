const { Router } = require('express')

const router = Router()
const {ormModelPromise} = require('../store/ormModel')
const util = require('../util')
const uuidV4 = require('uuid/v4')
const crypto = require('crypto')


router.post('/addAdmin',(req,res)=>{
    util.checkLogin(req,res)
    const {valueRecordSave} = req.body

    ormModelPromise.then(ormModel=>{
        const memberId = uuidV4()
        ormModel.member.modelSequelized.create({
            id:memberId,
            role:"admin",
            name:valueRecordSave.name,
            password:crypto.createHash('md5').update(valueRecordSave.password).digest('hex')
        })
            .then(()=>{
            ormModel.ticket.modelSequelized.create({
                id:uuidV4(),
                startTime:new Date(),
                memberId,
                ...valueRecordSave
            }).then(()=>{
                res.json()

            }).catch(err=>{
                console.log(err)

            })
        })

    })

})

router.post('/getAdmin',(req,res)=>{
    util.checkLogin(req,res)
    let content
    ormModelPromise.then(ormModel=>{
        ormModel.member.modelSequelized.findAll({
            where:{
                role:"admin",

            }
        })
            .then((memberAry)=>{
                content = memberAry
                const promiseAry = []
                for(let member of memberAry){
                    let promise = ormModel.ticket.modelSequelized.findOne({
                        where:{
                            memberId:member.id
                        }
                    }).then((ticket)=>{
                        member = {
                            ...member,
                            ...ticket
                        }
                    })

                    promiseAry.push(promise)
                }
                Promise.all(promiseAry).then(()=>{
                    res.json({
                        content
                    })
                })

            })

    })

})


module.exports = router
