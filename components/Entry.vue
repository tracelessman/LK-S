<template>
    <div v-show="isInited">
        <div id="app" v-cloak style="height: 100%">

            <div style="width: 100%;height: 64px;line-height:64px;background-color: #2d8cf0;color: white;padding-left: 15px;" >
                <div style="display: inline-block;float: right;margin-right: 30px;">
             <span style="color: white;font-size: 10pt;font-weight: bold;">
                    当前用户: admin
                </span>
                    <i-Button style="font-size: 10pt;font-weight: bold;margin-left:30px" type="primary" @click="logout">
                        退出
                    </i-Button>
                </div>
            </div>
            <div>
                <i-menu style="width:15%;float:left" active-name="item1" @on-select="menuOnSelect">
                    <Menu-Item name="item1">用户管理</Menu-Item>
                    <Menu-Item name="item2">日志管理</Menu-Item>
                </i-menu>
                <div style="padding:20px 50px;width:85%;float:right">
                    <div v-show="activeMenuName === 'item1'">
                        <customTable v-if="isInited" :ormModel="ormModel" :dict="dict" type="user" :ormService="{}">

                        </customTable>
                    </div>
                    <div v-show="activeMenuName === 'item2'">
                        <i-table border
                                 size="small" :data="recordsErrorReport" :columns="tableColumnsErrorReport">
                        </i-table>
                    </div>

                </div>
            </div>


            <Modal
                    v-model="showQRcodeModal"
                    title="注册二维码" >
                <!--<div style="text-align: center;margin:20px 0;font-size: 1.2em" v-html="qrcode">-->
                <!--</div>-->
                <div>
                    <div style='display: flex;flex-direction: column;justify-content: center;align-items: center'>
                        <img :src="qrcode"/>
                    </div>

                </div>
                <div slot="footer" style="overflow: auto">
                </div>
            </Modal>
        </div>





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
                activeMenuName:"item1",
                isInited:false,
                user:null,
                ormModel:null,
                dict:null

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
                        console.log(this.content)

                    }else{
                        // location = '/login'
                    }
                }
            })

            httpPost({
                url:"/api/orm/getOrm",
                successCb:(content)=>{
                    this.isInited = true
                    console.log(content)
                    this.ormModel = content.ormModel
                    this.dict = content.dict

                }
            })





        }
    }
</script>

<style scoped>

</style>
