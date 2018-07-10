const { Router } = require('express')
const crypto = require('crypto')
let hfsMd5 = crypto.createHash('md5').update('hfs').digest('hex')

const router = Router()


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

    }



    res.json({a:23})


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
