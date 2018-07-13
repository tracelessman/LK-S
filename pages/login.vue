<template>
    <div style="padding-top:200px">
        <Card :bordered="true" style="width:400px;margin:auto;">
            <p slot="title">
                <Icon type="log-in"></Icon>
                系统登录
            </p>
            <div style="text-align:center">
                <i-input style="margin:10px;padding:0 30px" v-model="user.name.value" ref="name">
                        <span slot="prepend">
                            <Icon :size="16" type="person"></Icon>
                        </span>
                </i-input>

                <i-input type="password" style="margin:10px;padding:0 30px" v-model="user.password.value" ref="password" @keyup.native.enter="login">
                        <span slot="prepend">
                            <Icon :size="16" type="locked"></Icon>
                        </span>
                </i-input>
                <div style="margin-top: 20px">
                    <i-button type="ghost" style="width:100px;" @click="login">登录</i-button>
                </div>
            </div>
        </Card>
    </div>

</template>

<script>
    const {httpPost} = require('../frontend/util')
    import axios from '~/plugins/axios'
    const frontState = require("../state/frontState")

    export default {
        async asyncData () {
            return {
                user:{
                    name:{
                        title:'用户名'
                    },
                    password:{
                        title:'密码'
                    }
                },
            }
        },
        head () {
            return {
                title: '登录'
            }
        },
        methods:{
            login(){

                for(let key in this.user){
                    const obj = this.user[key]
                    if(!obj.value){
                        this.$Message.info(`请将${obj.title}补充完整`)
                        this.$refs[key].focus()
                        return
                    }
                }
                httpPost({
                    url:'/api/user/login',
                    param:{
                        name:this.user.name.value,
                        password:this.user.password.value
                    },
                    successCb(content){
                        location = '/'
                    }
                })

            },
        },
        beforeMount(){
            if(!frontState.rootView){
                frontState.rootView = this
            }
        }
    }
</script>

<style scoped>

</style>
