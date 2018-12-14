const { Router } = require('express')
const router = Router()
const {ormServicePromise} = require('../store/ormService')
const util = require('../util')
const MCodeManager = require('../transfer/MCodeManager')
const uuid = require('uuid')

router.post('/getTreeData', (req, res) => {
  util.checkLogin(req, res);
  (async () => {
    const ormService = await ormServicePromise
    const recordAry = await ormService.org.getAllRecords()
    const content = recordAry

    res.json({
      content
    })
  })()
})

router.post('/setRoot', async (req, res) => {
  util.checkLogin(req, res)
  const {orgName} = req.body
  const ormService = await ormServicePromise
  const recordAry = await ormService.org.getAllRecords()

  const {length} = recordAry
  let result
  if (length === 0) {
    const id = uuid()
    let org = {
      id,
      name: orgName
    }
    await ormService.org.addRecord(org)
    MCodeManager.resetSingleOrgMagicCode(id)
    result = {}
  } else {
    result = {
      errorMsg: '根节点已存在,不可再次添加'
    }
  }

  res.json(result)
})

router.post('/addOrg', (req, res) => {
  util.checkLogin(req, res);
  (async () => {
    let {record} = req.body
    const ormService = await ormServicePromise
    await ormService.org.addRecord(record)

    MCodeManager.resetSingleOrgMagicCode(record.id)
    res.json()
  })()
})

router.post('/updateRecord', (req, res) => {
  util.checkLogin(req, res);
  (async () => {
    let {record} = req.body
    const ormService = await ormServicePromise

    await ormService.org.updateRecord(record)
    MCodeManager.resetSingleOrgMagicCode(record.id)
    res.json()
  })()
})

router.post('/deleteRecordMultiple', (req, res) => {
  util.checkLogin(req, res);
  (async () => {
    let {idAry} = req.body
    // console.log(idAry)

    const ormService = await ormServicePromise

    await ormService.org.deleteRecordMultipleByIdAry(idAry)
    const promiseAry = []
    for (let ele of idAry) {
      const p = MCodeManager.resetSingleOrgMagicCode(ele)
      promiseAry.push(p)
    }
    await Promise.all(promiseAry)
    res.json()
  })()
})

module.exports = router
