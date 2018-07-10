const axios = require('axios')
const commonUtil = require('./commonUtil')
const frontState = require("../state/frontState")
const {rootView} = frontState


const netUtil = {
    httpPost(option){
        const {url,param,successCb,failCb} = option


        axios({
                headers: { 'content-type': 'application/json' },
                method: 'post',
                url: url,
                data: commonUtil.objectify(param)
            })
            .then( (response)=>{
                const {data} = response
                const {error,content,errorMsg} = data
                if(error){
                    if(commonUtil.runFunc(failCb,error)){
                        console.log(error)
                    }else{
                        processError(error,errorMsg)
                    }
                }else{
                    commonUtil.runFunc(successCb,content)
                }
            })
            .catch((error)=>{
                axios.get('https://www.baidu.com/').then(()=>{

                    processError(error)
                }).catch(error=>{
                    rootView.$Message.error({
                        content: `网络已断开,请检查您的网络连接!`,
                        duration: 5
                    })
                })
            });

    },

}

function processError(err,errorMsg){
    if(!errorMsg){
        errorMsg = '操作失败!'
    }
    rootView.$Message.error(errorMsg)
    console.log(err)
}

module.exports = netUtil
