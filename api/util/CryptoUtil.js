/* eslint-disable new-cap */

const aesjs = require('aes-js')
const md5 = require('crypto-js/md5')
const NodeRSA = require('node-rsa')
const _ = require('lodash')
const config = require('../../config')

const {ormServicePromise} = require('../store/ormService')

const {encrypt} = config
const {counter} = encrypt

class CryptoUtil {
  static encryptAES ({
    aesKey = encrypt.aesKey, data
  }) {
    const textBytes = aesjs.utils.utf8.toBytes(data)
    const aesCtr = new aesjs.ModeOfOperation.ctr(aesKey, new aesjs.Counter(counter))
    const encryptedBytes = aesCtr.encrypt(textBytes)
    const encryptedHex = aesjs.utils.hex.fromBytes(encryptedBytes)
    return encryptedHex
  }

  static decryptAES ({
    aesKey = encrypt.aesKey, data
  }) {
    const encryptedBytes = aesjs.utils.hex.toBytes(data)
    const aesCtr = new aesjs.ModeOfOperation.ctr(aesKey, new aesjs.Counter(counter))
    const decryptedBytes = aesCtr.decrypt(encryptedBytes)
    const decryptedText = aesjs.utils.utf8.fromBytes(decryptedBytes)
    return decryptedText
  }

  // metaData is an object,
  // privateKey, {Blob}
  static generateQrcode ({
    privateKey,
    metaData
  }) {
    const key = new NodeRSA()

    key.importKey(privateKey, encrypt.privateKeyFormat)
    const signature = key.sign(Buffer.from(md5(CryptoUtil.toJsonStringUniq(metaData)).toString()), encrypt.signatureFormat, encrypt.sourceFormat)
    const qrCodeData = {
      ...metaData,
      signature
    }

    const encryptedStr = CryptoUtil.encryptAES({
      data: JSON.stringify(qrCodeData)
    })

    return encryptedStr
  }

  // publicKey, {Blob}
  static verifyQrcode ({
    publicKey,
    qrCode
  }) {
    qrCode = JSON.parse(CryptoUtil.decryptAES({
      data: qrCode
    }))
    let signature = qrCode.signature
    const metaData = _.cloneDeep(qrCode)

    delete metaData.signature

    const key = new NodeRSA()

    key.importKey(publicKey, encrypt.publicKeyFormat)
    const pass = key.verify(Buffer.from(md5(CryptoUtil.toJsonStringUniq(metaData)).toString()), signature,
      encrypt.sourceFormat, encrypt.signatureFormat)
    if (pass) {
      return qrCode.ticketId
    }
    return pass
  }

  // obj to uniq json str
  static toJsonStringUniq (obj) {
    const resultObj = {}
    const keyAry = Object.keys(obj).sort()
    for (let ele of keyAry) {
      resultObj[ele] = obj[ele]
    }
    const result = JSON.stringify(resultObj)
    return result
  }

  static async test () {
    const ormService = await ormServicePromise
    const record = await ormService.user.getFirstRecord()

    const qrCode = await CryptoUtil.generateQrcode({
      privateKey: record.privateKey,
      metaData: {
        a: 'test'
      }
    })
    const result = await CryptoUtil.verifyQrcode({
      publicKey: record.publicKey,
      qrCode
    })

    console.log('test result', result)
  }
}

// CryptoUtil.test()

Object.freeze(CryptoUtil)
module.exports = CryptoUtil
