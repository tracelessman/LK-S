<template>
    <div>
        <div id="app" style="">
            <div style="height: 64px;line-height:64px;background-color: #2d8cf0;color: white;padding-left: 15px;" >
               <span style="float:left;font-size: 20px" class="style1">
                        {{title}}
               </span>
                <div style="display: inline-block;float: right;margin-right: 30px;">
                    <span style="font-size: 14px"  class="style1">
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
                        日志管理
                    </div>
                </div>
            </div>
            <!--<Modal-->
                    <!--v-model="showQRcodeModal"-->
                    <!--title="注册二维码" >-->
                <!--&lt;!&ndash;<div style="text-align: center;margin:20px 0;font-size: 1.2em" v-html="qrcode">&ndash;&gt;-->
                <!--&lt;!&ndash;</div>&ndash;&gt;-->
                <!--<div>-->
                    <!--<div style='display: flex;flex-direction: column;justify-content: center;align-items: center'>-->
                        <!--<img :src="qrcode"/>-->
                    <!--</div>-->

                <!--</div>-->
                <!--<div slot="footer" style="overflow: auto">-->
                <!--</div>-->
            <!--</Modal>-->
        </div>
    </div>
</template>

<script>
    const axios = require('axios')

    const {httpPost} = require('../../frontend/util')
    import customTable from '~/components/common/customTable'

    export default {
        name: 'Frame',
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
        methods:{
            logout(){

            },
            menuOnSelect(name){
                this.activeMenuName = name
            },
        },
        mounted(){


            httpPost({
                url:"/api/orm/getOrm",
                successCb:(content)=>{
                    this.isInited = true
                    console.log(content)
                    this.ormModel = content.ormModel
                    this.dict = content.dict

                }
            })
        },
        props:{
            title:{
                required:false,
                type:String,
                default:()=>{
                    return ""
                }
            }
        }
    }
</script>

<style scoped>
    .style1{
        color: white;font-weight: bold;
    }

</style>
