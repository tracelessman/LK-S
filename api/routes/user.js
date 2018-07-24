const { Router } = require('express')
const crypto = require('crypto')

const qr = require('qr-image');
const router = Router()
const {ormServicePromise} = require('../store/ormService')
const key = 'user'
const util = require('../util')
const config = require('../../config')
const NodeRSA = require('node-rsa');
const aesjs = require('aes-js')
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
            const md5Val = crypto.createHash('md5').update(password).digest('hex')
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
            const credentialResult = await ormService['member'].queryExact({
                name,
                password:crypto.createHash('md5').update(password).digest('hex')
            })
            const {length} = credentialResult
            if(length === 0){
                const userResult = await ormService['member'].queryExact({
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
    const {oldPassword,newPassword,newPasswordAgain} = req.body
    const result = {

    }
    const {role} = req.session.user
    if(role === 'super'){
        (async()=>{
            const ormService =  await ormServicePromise
            const metaRecord = await ormService.meta.getFirstRecord()
            if(crypto.createHash('md5').update(oldPassword).digest('hex') === metaRecord.superPassword){

                await ormService.meta.updateRecord({
                    superPassword:crypto.createHash('md5').update(newPassword).digest('hex'),
                    id:metaRecord.id
                })
            }else{
                result.errorMsg = "旧密码错误,请核对后重试"
            }
            res.json(result)

        })()
    }
})

router.post('/logout',(req,res)=>{
    req.session.user = null

    res.json({
        isExpired:true
    })
})

router.post('/addUser',(req,res)=>{
    util.checkLogin(req,res)
   ;(async()=>{
        const ormService = await ormServicePromise
        const record = req.body.valueRecordSave

        const key = new NodeRSA({b: 512});
        const publicKey = key.exportKey(config.encrypt.publicKeyFormat)
        const privateKey = key.exportKey(config.encrypt.privateKeyFormat)
        console.log(privateKey)


        record.publicKey = publicKey
        record.privateKey = privateKey

        record.isRegistered = false
        record.registerStartTime = new Date()
        await ormService.user.addRecord(record)
        res.json()
   })()



})

router.post('/getAllUser',(req,res)=>{
    util.checkLogin(req,res)
    ;(async()=>{
        const ormService = await ormServicePromise

        let result = await ormService.user.getAllRecords()
        result = result.map(ele=>{
            return ele.dataValues
        })

        res.json({
            content:result
        })
    })()



})
router.post('/deleteRecordMultiple',(req,res)=>{
    util.checkLogin(req,res);
    (async()=>{
        const ormService = await ormServicePromise

        await ormService.user.deleteRecordMultiple(req.body.idAry)

        res.json()
    })()



})

router.post('/updateRecord',(req,res)=>{
    util.checkLogin(req,res);
    (async()=>{
        const ormService = await ormServicePromise

        const record = req.body.valueRecordSave

        await ormService.user.updateRecord(record)

        res.json()
    })()



})

router.post('/qrcode', function(req, res, next) {
    const {id} = req.body;

    (async()=>{
         const ormService = await ormServicePromise
         const record = await ormService.user.getRecordById(id)
        const key = new NodeRSA();

        key.importKey(record.privateKey, config.encrypt.privateKeyFormat);

        const qrcodeData = {
            action:"registerForAdmin",
            code:"LK",
            id,
            signature:key.sign(id,config.encrypt.signatureFormat,config.encrypt.sourceFormat)
        }
        const textBytes = aesjs.utils.utf8.toBytes(JSON.stringify(qrcodeData));
        const aesCtr = new aesjs.ModeOfOperation.ctr(config.encrypt.aesKey, new aesjs.Counter(5));
        const encryptedBytes = aesCtr.encrypt(textBytes);
        const encryptedHex = aesjs.utils.hex.fromBytes(encryptedBytes);

        res.json({
            content:{
                qrcodeData:encryptedHex
            }

        });

    })()


});




module.exports = router
