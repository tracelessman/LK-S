<template>
    <div>
        <div style="text-align: center;font-size: 3em" v-if="isIphone">
            <div>
                <img src="/img/app2.png" style="width:40%;margin:100px;border-radius: 15px;margin-top: 100px"/>
            </div>
            <div>
                <i-button @click="click" type="primary" shape="circle" size="large" icon="ios-cloud-download-outline" style="width:50%;height: 120px;font-size: 1.3em;border-radius: 80px">下载LK</i-button>
            </div>
            <div style="margin-top: 30px;color:#2d8cf0">
                {{this.info}}
            </div>
        </div>
        <div  style="text-align: center;font-size: 1.2em;" v-else>
            <img id='barcode'
                 src="https://api.qrserver.com/v1/create-qr-code/?data=<%=url%>/app&amp;size=200x200"
                 alt=""
                 title="HELLO"
                 width="100px"
                 height="100px"
                 style="margin-top: 200px"
            />
            <div style="margin-top: 30px;color:#2d8cf0">
                {{this.info}}
            </div>
        </div>
    </div>
</template>

<script>
  export default {
    name: "app",
    data() {
      return  {
        info:"请用您的iphone或ipad加载本网页或扫描页面上的二维码",
        isIphone:true,
        url:"itms-services://?action=download-manifest&url=https://raw.githubusercontent.com/tracelessman/LK-M/manifest/manifest.plist"
      }
    },
    methods: {
      click(){
        location.href = this.url
      }
    },
    mounted:function(){
      // alert(navigator.userAgent)
      if(!navigator.userAgent.includes("iPhone")){
        // this.isIphone = false
        // this.$Modal.info({
        //     title: "提示",
        //     content: this.info
        // });
      }else{
        if(navigator.userAgent.includes("QQ")&&!navigator.userAgent.includes("QQBrowser")){
          alert("请在手机浏览器中打开本网页")
        }
      }
    },
  }
</script>

<style scoped>

</style>
