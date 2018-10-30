const { Router } = require('express')
const fs = require('fs')
const path = require('path')
const router = Router()
const config = require('../../config')
const rootPath = path.resolve(__dirname, '../../')
const updateJsonPath = path.resolve(rootPath, 'public/pkg/updateMeta.json')
const serverVersion = require('../../package.json').version
const semver = require('semver')

router.post('/checkUpdateGeneral', (req, res) => {
  const {
    os, __DEV__, customInfo, bundleId, uniqueId, buildNumberClient,
    updateAnyWay, wantPreview, versionLocal, isPreviewVersionClient, previewVersion
  } = req.body
  console.log(req.body)
  const {id, name, isDevMode} = customInfo
  let content = fs.readFileSync(updateJsonPath, 'utf8')
  let updateMeta = JSON.parse(content)

  const newVersion = updateMeta.newVersion
  const buildNumberServer = updateMeta.buildNumberServer
  const previewVersionServer = updateMeta.previewVersionServer
  const previewBuildNumber = updateMeta.previewBuildNumber
  const nextVersion = updateMeta.nextVersion

  let result = {
    needUpdate: false,
    isHotUpdate: true,
    buildNumberServer, // 原生模块版本号
    newVersion,
    isForce: true,
    hash: undefined,
    os,
    manifestUrl: undefined,
    apkUrl: undefined,
    ppkUrl: undefined,
    manualDownloadUrl: `${config.url}/app`,
    isPreviewVersion: false,
    fileName: undefined,
    updatePlatform: ['ios', 'android'],
    serverVersion,
    isSilent: false,
    nextVersion
  }

  // 如果服务器版本号高于本地版本,则必然更新
  if (semver.gt(newVersion, versionLocal)) {
    result.needUpdate = true
    prepareUpdate(false)
  } else {
    if (wantPreview) {
      if (previewVersionServer && (!previewVersion || semver.gt(previewVersionServer, previewVersion))) {
        db.all('select * from group_members where gid = ? ', ['d4c5298d-ad56-4d42-aa10-dd0e93ff234e1528292987053'], function (err, rows) {
          if (err) {
            result = {
              error: err.toString()
            }
          } else {
            let isInDevTeam = rows.some(ele => {
              return ele.uid === id
            })
            if (isInDevTeam) {
              result.needUpdate = true
              result.isPreviewVersion = true
              prepareUpdate(true)
            }
          }
        })
      } else {
        prepareUpdate(false)
      }
    }
  }

  // 如果updateAnyWay,那就需要更新
  if (updateAnyWay) {
    result.needUpdate = true
  }
  // 如果是处于开发状态,则不需要更新
  if (__DEV__) {
    result.needUpdate = false
  }
  console.log(result)
  res.end(JSON.stringify(result))

  function prepareUpdate (isPreview) {
    result.buildNumberServer = isPreview ? buildNumberServer : previewBuildNumber

    // 原生版本不同必然原生更新
    if (semver.gt(buildNumberServer, buildNumberClient)) {
      result.needUpdate = true
      result.isHotUpdate = false
    } else {
      result.isHotUpdate = true
    }
    let fileName, filePath
    const middlePath = isPreview ? '/preview' : ''
    const ppkPostFix = `/pkg${middlePath}/ppk/${config.appName}.ppk`
    const apkPostFix = `/pkg${middlePath}/android/${config.appName}.apk`

    if (result.isHotUpdate) {
      fileName = `${config.appName}.ppk`
      filePath = path.resolve(rootPath, `public/pkg${middlePath}/ppk/${fileName}`)
    } else {
      if (os === 'ios') {
        fileName = `${config.appName}.ipa`
      } else {
        fileName = `${config.appName}.apk`
      }
      filePath = path.resolve(rootPath, `public/pkg${middlePath}/${os}/${fileName}`)
    }

    if (fs.existsSync(filePath)) {
      result.hash = commonUtil.getMd5(filePath)
    } else {
      const error = `${filePath} not founded`
      console.log(error)

      result.error = error
    }
    result.fileName = fileName
    result.apkUrl = `${config.url}${apkPostFix}`
    result.ppkUrl = `${config.url}${ppkPostFix}`
    result.manifestUrl = isPreview ? config.manifestPreviewUrl : config.manifestUrl

    if (result.isPreviewVersion) {
      result.isForce = false
    }

    // console.log(result)
  }
})

router.post('/test', (req,res) => {
  res.end('dosth')
})

module.exports = router
