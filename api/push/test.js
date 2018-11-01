const push = require(__dirname)

let uuid = 'a1a53179a5a261cef2f404f96d59110c573bc0bceb4808e4fa8c5f1163a46653'
// uuid = '32b713f56b56db6b5aa8524b67aed8da2bd2058e8ee66f31963a15dcb9a5419e'
const option = {
  alert: 'this is a notification test', badge: 2, deviceTokenAry: [uuid], isProduction: true
}
const sth = push._pushIOS(option)
sth.then(() => {
  console.log('lk')
})
