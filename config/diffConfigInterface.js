const diffConfig = require('./diffConfig')
const {objectUtil} =require('@ys/external')
const config = {
    db:{
        username:"",
        password:""
    },
    sshInfo:{
        username:"",
        password:""
    }
}
Object.assign(config,diffConfig)
objectUtil.insureAllKey(config,{
    assert:true
})

Object.freeze(config)
module.exports = config
