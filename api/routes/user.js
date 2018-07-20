const { Router } = require('express')
const crypto = require('crypto')
const md5Algorithm = crypto.createHash('md5')


const router = Router()
const {ormServicePromise} = require('../store/ormService')
const key = 'user'
const util = require('../util')
const config = require('../../config')

//role:super,admin,common
router.post('/login',(req,res)=>{

    const {name,password} = req.body
    const user ={
        name
    }
    let result = {
        content:user
    }

    if(!name || !password){
        result = {
            error:new Error("非法请求")
        }
    }
    (async function(){
        const ormService =  await ormServicePromise

        if(name === 'super'){
            const recordAry = await ormService.meta.getAllRecords()
            const {length} = recordAry
            const md5Val = md5Algorithm.update(password).digest('hex')
            let pass = false
            if(length === 0){
                if(md5Val === config.superDefaultPassword){
                    pass = true
                }
            }else{
                if(md5Val === recordAry[0].superPassword){
                    pass = true
                }
            }
            if(pass){
                user.role = 'super'
                req.session.user = user

            }else{
                result = {
                    errorMsg:"非法请求"
                }
            }
        }else{
            const credentialResult = await ormService[key].queryExact({
                name,
                password:crypto.createHash('md5').update(password).digest('hex')
            })
            const {length} = credentialResult
            if(length === 0){
                const userResult = await ormService[key].queryExact({
                    name
                })
                let userCount = userResult.length

                if(userCount === 0){
                    result = {
                        errorMsg:"不存在该用户,请核对后重试"
                    }
                }else{
                    result = {
                        errorMsg:"密码错误,请核对后重试"
                    }
                }
            }else if(length === 1){
                req.session.user = user
                user.role = 'admin'
            }else{

            }
        }

        res.json(result)
    })()



})


router.post('/checkLogin',(req,res)=>{


    res.json({
        error:null,
        content:{
            user:req.session.user
        }
    })
})

router.post('/changePassword',(req,res)=>{
    util.checkLogin(req,res)
    const {role} = req.session.user
    if(role === 'super'){
        (async()=>{
            const ormService =  await ormServicePromise
            // ormService.meta.
        })()
    }
})

router.post('/logout',(req,res)=>{
    util.checkLogin(req,res)
    req.session.user = null

    res.json({
        isExpired:true
    })
})





module.exports = router
