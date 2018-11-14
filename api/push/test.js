const push = require(__dirname)

let uuid = '515fa5421f4bf889e05d1b8ddf780f164df3474d1a8b4e12e293acc3ddd13207'
// uuid = '32b713f56b56db6b5aa8524b67aed8da2bd2058e8ee66f31963a15dcb9a5419e'
const option = {
  alert: 'this is a notification test', badge: 2, deviceTokenAry: [uuid], isProduction: false
}
const sth = push._pushIOS(option)
console.log(1)
sth.then(() => {
  console.log('lk')
})
console.log(2)
