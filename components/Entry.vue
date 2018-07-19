<template>
    <div>
        <MainFrame v-if="isInited" title="LK控制管理系统"></MainFrame>
    </div>
</template>

<script>
    const {httpPost} = require('../frontend/util')
    import MainFrame from './common/MainFrame'
    export default {
        name: 'entry',
        components:{
            MainFrame
        },
        data(){
            return {
                isInited:false

            }
        },
        mounted(){

            httpPost({
                url:"/api/user/checkLogin",
                successCb:(content)=>{
                    console.log(content)

                    const {user} = content
                    if(user){
                        this.isInited = true
                        this.user = user

                    }else{
                        location = '/login'
                    }
                }
            })
        }
    }
</script>

<style scoped>
    .style1{
        color: white;font-weight: bold;
    }

</style>
