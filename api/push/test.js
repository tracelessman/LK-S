const push = require(__dirname)

const uuid = '88e80aebb6f04ca1c00e5abaa250aba7b361cf984cb74b88df129fb1116f19c6'
const option = {
  alert: 'this is a notification test', badge: 2, deviceTokenAry: [uuid], isProduction: false
}
const sth = push.pushIOS(option)
sth.then(() => {
  console.log('lk')
})
