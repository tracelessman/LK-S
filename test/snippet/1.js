const axios = require('axios')
axios.get("https://www.baidu.com/").then(res=>{
    console.log(res)

}).catch(error=>{
    console.log('error')

    console.log(error)

})
