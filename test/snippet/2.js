const crypto = require('crypto')
let result = crypto.createHash('md5').update('hfs').digest('hex')
console.log(result)
