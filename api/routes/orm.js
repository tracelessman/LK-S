const { Router } = require('express')

const router = Router()
const {ormModelPromise} = require('../store/ormModel')
const dict = require('../../business/dict')

router.post('/getOrm',(req,res)=>{
    ormModelPromise.then((ormModel)=>{
        res.json({
            ormModel,
            dict
        })
    })
})

module.exports = router
