const { Router } = require('express')
const path = require('path')
const rootPath = path.resolve(__dirname, '../../')

const router = Router()
const {ormServicePromise} = require('../store/ormService')
const util = require('../util')
const codeUtil = require(path.resolve(rootPath, 'api/util/codeUtil'))
const _ = require('lodash')

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

router.post('/setRoot', (req, res) => {
  util.checkLogin(req, res);
  (async () => {
    const {orgName} = req.body
    const ormService = await ormServicePromise
    const recordAry = await ormService.org.getAllRecords()

    const {length} = recordAry
    let result

    if (length === 0) {
      let org = {
        name: orgName
      }
      org = await addCode(org)
      await ormService.org.addRecord(org)

      result = {}
    } else {
      result = {
        errorMsg: '根节点已存在,不可再次添加'
      }
    }

    res.json(result)
  })()
})

async function addCode (option) {
  const org = _.cloneDeep(option)
  org.mCode = await codeUtil.getOrgMcode(org)
  return org
}

router.post('/addOrg', (req, res) => {
  util.checkLogin(req, res);
  (async () => {
    let {record} = req.body
    const ormService = await ormServicePromise
    record = await addCode(record)

    await ormService.org.addRecord(record)

    res.json()
  })()
})

router.post('/updateRecord', (req, res) => {
  util.checkLogin(req, res);
  (async () => {
    let {record} = req.body
    const ormService = await ormServicePromise

    await ormService.org.updateRecord(record)

    res.json()
  })()
})

router.post('/deleteRecordMultiple', (req, res) => {
  util.checkLogin(req, res);
  (async () => {
    let {idAry} = req.body
    console.log(idAry)

    const ormService = await ormServicePromise

    await ormService.org.deleteRecordMultipleByIdAry(idAry)

    res.json()
  })()
})

module.exports = router
