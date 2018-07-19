<template>
    <div>
        <div id="app" style="">
            <div style="height: 64px;line-height:64px;background-color: #2d8cf0;color: white;padding-left: 15px;" >
               <span style="float:left;font-size: 20px" class="style1">
                        {{title}}
               </span>
                <div style="display: inline-block;float: right;margin-right: 40px;">
                    <Dropdown class="style1" @on-click="test" placement="bottom" >
                        <Button type="primary" style="font-size: 14px;font-weight:bold">
                            admin
                            <Icon type="arrow-down-b"></Icon>
                        </Button>
                        <DropdownMenu slot="list"  >
                            <DropdownItem name="changePassword">修改密码</DropdownItem>
                            <DropdownItem divided name="logout">注销</DropdownItem>
                        </DropdownMenu>
                    </Dropdown>

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
        <Modal v-model="showChangePassword" title='修改密码'>

        </Modal>
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
                dict:null,
                showChangePassword:true

            }
        },
        methods:{
            logout(){
                httpPost({
                    url:"/api/user/logout",
                    successCb:(content)=>{

                    }
                })
            },
            menuOnSelect(name){
                this.activeMenuName = name
            },
            changePassword(){

                httpPost({
                    url:"/api/user/changePassword",
                    successCb:(content)=>{
                       this.$Message.success("密码已修改")
                    }
                })
            },
            test(name){
               this[name]()
            }
        },
        mounted(){

            httpPost({
                url:"/api/orm/getOrm",
                successCb:(content)=>{
                    this.isInited = true
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
