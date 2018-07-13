const { Router } = require('express')

const router = Router()

router.get('/ping',(req,res)=>{
    res.json({
        time:new Date()
    })
})

module.exports = router
