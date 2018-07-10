<template>
    <div v-show="isInited">

    </div>
</template>

<script>
    const axios = require('axios')

    const {httpPost} = require('../util')

    export default {
        name: 'entry',
        data(){
            return {
                isInited:false,
                user:null
            }
        },
        mounted(){
            httpPost({
                url:"/api/user/checkLogin",
                successCb:(content)=>{
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

</style>
