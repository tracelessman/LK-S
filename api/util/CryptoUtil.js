/* eslint-disable new-cap */

const aesjs = require('aes-js')
const md5 = require('crypto-js/md5')
const NodeRSA = require('node-rsa')
const _ = require('lodash')

const encrypt = {
  publicKeyFormat: 'pkcs8-public-der',
  privateKeyFormat: 'pkcs1-der',
  signatureFormat: 'hex',
  sourceFormat: 'utf8',
  aesKey: [ 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16 ],
  counter: 5
}
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
    const signatureRaw = key.sign(CryptoUtil.toJsonStringUniq(metaData), encrypt.signatureFormat, encrypt.sourceFormat)
    const signature = md5(signatureRaw).toString()

    const qrCodeData = {
      ...metaData,
      signature
    }

    return CryptoUtil.encryptAES({
      data: JSON.stringify(qrCodeData)
    })
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
    const pass = key.verify(CryptoUtil.toJsonStringUniq(metaData), signature,
      encrypt.sourceFormat, encrypt.signatureFormat)

    if (pass) {
      return qrCode.ticketId
    }
    return pass
  }

  // obj to uniq json str
  static toJsonStringUniq (obj) {
    const result = {}
    const keyAry = Object.keys(obj).sort()
    for (let ele of keyAry) {
      result[ele] = obj[ele]
    }
    return JSON.stringify(result)
  }
}

Object.freeze(CryptoUtil)
module.exports = CryptoUtil
