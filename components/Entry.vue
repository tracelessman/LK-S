<template>
    <div v-show="isInited">
        main
    </div>
</template>

<script>
    const axios = require('axios')

    const {httpPost} = require('../frontend/util')
    import customTable from '~/components/common/customTable'

    export default {
        name: 'entry',
        components:{
            customTable
        },
        data(){
            return {
                isInited:true,
                user:null

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
                        // location = '/login'
                    }
                }
            })



        }
    }
</script>

<style scoped>

</style>
