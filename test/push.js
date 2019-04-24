const apn = require('apn')
const path = require('path')
const rootPath = path.resolve(__dirname, '../')

function _pushIOS (alert, badge, deviceTokens, production) {
  return new Promise(resolve => {
    const options = {
      token: {
        key: path.resolve(rootPath, 'certificate/serviceKey.p8'),
        keyId: 'P5T562567F',
        teamId: '355R83R4YL'
      },
      production
    }

    const apnProvider = new apn.Provider(options)
    let notification = new apn.Notification()
    notification.alert = alert
    notification.sound = 'slow-spring-board-longer-tail.mp3'
    notification.badge = badge
    notification.topic = 'com.hfs.traceless'
    notification.payload = {
      a: 23,
      b: 'ddffs'
    }

    apnProvider.send(notification, deviceTokens).then((response) => {
      console.log(response)

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

function pushIOS (alert, badge, deviceTokens, production) {
  Promise.all([
    _pushIOS(alert, badge, deviceTokens, production)]).then((productionResult, devResult) => {
    if (!productionResult && !devResult) {
      console.log('push goes wrong')
      console.log(deviceTokens)
      console.log(alert)
    }
    process.exit(0)
  })
}

const spiritDevDid = '595ad4552c99b47a07f643de2ab9ec0c199feda49268c8091827368944b40a86'
const id2 = 'eee94b73d90e15a731368b4b8116c47aeece088f9a53f06ea29d70053d6e766c'
pushIOS('0808990', 1, [spiritDevDid, id2], false)
