const { Router } = require('express')
const path = require('path')
const rootPath = path.resolve(__dirname,'../../')
const router = Router()
const {ormModelPromise} = require('../store/ormModel')
const {ormServicePromise} = require('../store/ormService')
const util = require('../util')
const codeUtil = require(path.resolve(rootPath,'api/util/codeUtil'))
const uuid = require('uuid')
const config = require('../../config')
const NodeRSA = require('node-rsa');
const aesjs = require('aes-js');

router.post('/addMember',(req,res)=>{
    util.checkLogin(req,res)
    const {valueRecordSave,orgId} = req.body;

    (async()=>{
        const ormService = await ormServicePromise
        const {name,timeout,checkCode} = valueRecordSave
        const member = {
            id:uuid(),
            name,
            orgId,
        }
        member.mCode = await codeUtil.getMemberMCode()
        const ticket = {
            memberId:member.id,
            timeout,
            checkCode,
            startTime:new Date()
        }
         await ormService.member.addRecord(member)
         await ormService.ticket.addRecord(ticket)
        res.json()

    })()

})
router.post('/updateMember',(req,res)=>{
    util.checkLogin(req,res);
    (async()=>{
        const {valueRecordSave} =  req.body
        const ormService =  await ormServicePromise
        await ormService.member.updateRecord({
            ...valueRecordSave,
            id:valueRecordSave.memberId
        })
        await ormService.ticket.updateRecord({
            ...valueRecordSave,
            id:valueRecordSave.id
        })
        res.json()
    })()
})



router.post('/getAdmin',(req,res)=>{
    util.checkLogin(req,res)
    let content
    ormModelPromise.then(ormModel=>{
        ormModel.member.modelSequelized.findAll({
            where:{
                role:"admin",

            }
        }).then((memberAry)=>{
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

router.post('/deleteRecordMultiple',(req,res)=>{
    util.checkLogin(req,res);
    (async()=>{
        const {idAry} = req.body
        const ormService =  await ormServicePromise
        const promiseAry = []
        for(let ticket of idAry){


            const p1 = ormService.member.deleteRecord({id:ticket.memberId})
            const p2 = ormService.ticket.deleteRecord({id:ticket.id})
            promiseAry.push(p1,p2)

        }
        await Promise.all(promiseAry)
        res.json()
    })()
})


router.post('/getMemberByOrg',(req,res)=>{
    util.checkLogin(req,res);

    (async()=>{
        const {orgId} = req.body
        const ormService = await ormServicePromise
        const recordAry = await ormService.org.getAllRecords()
        const orgTree = getTree(recordAry)

        const idAry = []
        const _f2 = (obj)=>{
            idAry.push(obj.id)
            const {children} = obj
            if(children){
                for(let ele of children){
                    _f2(ele)
                }
            }
        }

        const _f = (ary)=>{
            for(let ele of ary){
                if(ele.id === orgId){
                    _f2(ele)
                    break
                }else{
                    const {children} = ele
                    if(children){
                        _f(children)
                    }
                }
            }
        }


        _f(orgTree)

        let promiseAry = []
        for(let orgId of  idAry){
            const p = ormService.member.queryByCondition({
                orgId
            })
            promiseAry.push(p)
        }
        let ary = []
        const result = await Promise.all(promiseAry)

        for(let aryELe of result){
            ary = ary.concat(aryELe)
        }
        for(let i=0;i < ary.length;i++){
            const ele = ary[i]
            const resultAry =  await ormService.ticket.queryByCondition({
                memberId:ele.id
            })
            ary[i] = Object.assign({},ary[i].dataValues,resultAry[0].dataValues)
        }

        res.json({
            content:ary
        })
    })()

})


function getTree(ary){

    let top
    let idObj = {}

    ary = ary.map(ele=>{
        let result = ele.dataValues
        return result
    })

    for(let ele of ary){
        if(ele.parentId){
            if(!idObj[ele.parentId]){
                idObj[ele.parentId] = []
            }

            idObj[ele.parentId].push(ele)
        }else{
            top = ele
        }
    }
    for(let ele of ary){
        const {id} = ele

        if(idObj.hasOwnProperty(id)){
            ele.children = idObj[id]
            for(let kid of ele.children){
                kid.parentNode = ele
            }
        }
    }
    const result = []
    if(top){
        result.push(top)
    }
    return result
}

router.post('/qrcode', function(req, res) {
    util.checkLogin(req,res);
    const {memberId,ticketId} = req.body;

    (async()=>{
        const ormService = await ormServicePromise
        const record = await ormService.user.getRecordById(req.session.user.id)
        const member = await ormService.member.queryExactOne({id:memberId})
        const ticket = await ormService.ticket.queryExactOne({id:ticketId})
        const key = new NodeRSA();

        key.importKey(record.privateKey, config.encrypt.privateKeyFormat);

        const metaData = {
            action:"register",
            code:"LK",
            id:memberId,
            ip:config.ip,
            port:config.wsPort,
            orgId:member.orgId,
            mCode:member.mCode,
            hasCheckCode:!!ticket.checkCode,
            name:member.name,
            url:config.url
        }//md5
        const qrcodeData = {
            ...metaData,
            signature:key.sign(JSON.stringify(metaData),config.encrypt.signatureFormat,config.encrypt.sourceFormat)
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
