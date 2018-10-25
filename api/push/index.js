const apn = require('apn')
const path = require('path')
const rootPath = path.resolve(__dirname, '../../')
const config = require(path.resolve(rootPath, 'config'))
const {bundleId} = config

module.exports = {
  pushIOS ({alert, badge, deviceTokenAry, isProduction}) {
    return new Promise(resolve => {
      const options = {
        token: {
          key: path.resolve(rootPath, 'certificate/pushServiceKey.p8'),
          keyId: 'XA79Y94CD8',
          teamId: '355R83R4YL'
        },
        production: isProduction
      }

      const apnProvider = new apn.Provider(options)
      let notification = new apn.Notification()
      notification.alert = alert
      notification.sound = 'ping.aiff'
      notification.badge = badge
      notification.topic = bundleId
      apnProvider.send(notification, deviceTokenAry).then((response) => {
        let result
        if (response.failed.length !== 0) {
          result = false
          for (let ele of response.failed) {
            console.log(ele.response)
          }
        } else {
          result = true
        }
        resolve(result)
      })
    })
  }
}
