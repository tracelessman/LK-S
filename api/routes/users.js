const { Router } = require('express')
const crypto = require('crypto')
const md5Algorithm = crypto.createHash('md5')
let hfsMd5 = md5Algorithm.update('hfs').digest('hex')

const router = Router()
const {ormServicePromise} = require('../store/ormService')
const key = 'user'


router.post('/login',(req,res)=>{

    const {name,password} = req.body
    const user ={
        name
    }
    let result

    if(!name || !password){
        result = {
            error:new Error("非法请求")
        }
    }
    if(name === 'superAdmin'){
        if(password === hfsMd5){
            user.role = 'superAdmin'
        }
    }else{
        ormServicePromise.then(ormService=>{
            ormService[key].queryExact({
                name,
                password:crypto.createHash('md5').update(password).digest('hex')
            }).then(result=>{
                console.log(result)
            }).catch(err=>{
                console.log(err)

            })
        })


    }



    res.json(result)


})


router.post('/checkLogin',(req,res)=>{
    res.json({
        error:null,
        content:{
            user:req.session.user
        }
    })
})





module.exports = router
