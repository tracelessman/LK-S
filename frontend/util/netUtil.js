// in vue context

const axios = require('axios')
const shareUtil = require('../../share/util')
const frontState = require('../../state/frontState')

const netUtil = {
  httpPost (option) {
    const {url, param, successCb, failCb} = option
    axios({
      headers: { 'content-type': 'application/json' },
      method: 'post',
      url,
      data: shareUtil.objectify(param)
    })
      .then((response) => {
        const {data} = response
        const {error, content, errorMsg, isExpired} = data
        if (error || errorMsg) {
          if (shareUtil.runFunc(failCb, error)) {
            console.log(error)
          } else {
            processError(error, errorMsg)
          }
        } else {
          if (isExpired) {
            location = '/login'
          } else {
            shareUtil.runFunc(successCb, content)
          }
        }
      })
      .catch((error) => {
        console.log(error)

        axios.get('api/test/ping', {
        }).then(() => {
          processError(error)
        }).catch(error => {
          console.log(error)

          frontState.rootView.$Message.error({
            content: `网络已断开,请检查您的网络连接!`,
            duration: 5
          })
        })
      })
  }

}

function processError (err, errorMsg) {
  if (!errorMsg) {
    errorMsg = '操作失败!'
  }
  frontState.rootView.$Message.error({
    duration: 4,
    content: errorMsg
  })
}

module.exports = netUtil
