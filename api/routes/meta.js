const { Router } = require('express')

const router = Router()
const {ormModelPromise} = require('../store/ormModel')
const util = require('../util')

router.post('/getPublicIp',(req,res)=>{
    util.checkLogin(req,res)
    ormModelPromise.then(ormModel=>{

        ormModel.meta.modelSequelized.findOne({
            where:{

            }
        }).then((record)=>{
            res.json({
                content:{
                    publicIp:record.publicIp
                }
            })

        })
    })



})

router.post('/changePublicIp',(req,res)=>{
    util.checkLogin(req,res)
    const {publicIp} = req.body
    ormModelPromise.then(ormModel=>{
             ormModel.meta.modelSequelized.findOne({
                where:{

                }
            }).then(metaRecord=>{

                ormModel.meta.modelSequelized.update({publicIp:publicIp},{
                    where:{
                        id:metaRecord.id
                    }
                }).then(()=>{
                    res.json({
                        content:{
                            publicIp:publicIp
                        }
                    })
                }).catch(err=>{
                    console.log(err)

                })
            })

        }
    )

})

module.exports = router
