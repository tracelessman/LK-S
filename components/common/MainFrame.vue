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
                    <Menu-Item name="item3">系统设置</Menu-Item>

                </i-menu>
                <div style="padding:20px 50px;width:85%;float:right">
                    <div v-show="activeMenuName === 'item1'">
                        <customTable v-if="isInited" :ormModel="ormModel" :dict="dict" type="user" :ormService="{}">

                        </customTable>
                    </div>
                    <div v-show="activeMenuName === 'item2'">
                        日志管理
                    </div>
                    <div v-show="activeMenuName === 'item3'">
                        <SystemSetting></SystemSetting>
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
            <div >
                <div style="margin:20px auto;text-align:center">
                    <div class="style4">
                        <span style="" class="style2">旧密码</span>
                        <Input v-model="change.oldPassword" ref="oldPassword" style="" class="style3" type="password"/>
                    </div>
                    <div class="style4">
                        <span class="style2">新密码:</span>
                        <Input v-model="change.newPassword" ref="newPassword" class="style3" type="password"/>

                    </div>
                    <div class="style4">
                        <span class="style2">确认新密码:</span>
                        <Input v-model="change.newPasswordAgain" ref="newPasswordAgain" class="style3" type="password"/>
                    </div>
                </div>

            </div>

            <div slot="footer" style="overflow:auto">
                <i-col span="24" style="text-align: center;">
                    <i-button type='primary' size="small" @click="reset" class="style5" >重置</i-button>

                    <i-button type='primary' size="small" @click="save" class="style5"  >保存</i-button>
                </i-col>
            </div>
        </Modal>
    </div>
</template>

<script>
    const axios = require('axios')

    const {httpPost} = require('../../frontend/util')
    import customTable from '~/components/common/customTable'
    import SystemSetting from '~/components/SystemSetting'



    export default {
        name: 'Frame',
        components:{
            customTable,SystemSetting
        },
        data(){
            return {
                activeMenuName:"item1",
                isInited:false,
                user:null,
                ormModel:null,
                dict:null,
                showChangePassword:false,
                change:{
                    oldPassword:null,
                    newPassword:null,
                    newPasswordAgain:null
                }

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
                this.showChangePassword = true
            },
            test(name){
               this[name]()
            },
            save(){
                for(let key in this.change){
                    if(!this.change[key]){
                        this.$Message.warning("请将内容填写完整")
                        this.$refs[key].focus()
                        break
                    }
                }
                if(this.change.newPassword !== this.change.newPasswordAgain){
                    this.$Message.warning("两次输入密码不一致")
                    this.$refs['newPasswordAgain'].focus()
                }else{
                    httpPost({
                        url:"/api/user/changePassword",
                        param:{
                            oldPassword:this.change.oldPassword,
                            newPassword:this.change.newPassword,
                            newPasswordAgain:this.change.newPasswordAgain
                        },
                        successCb:(content)=>{
                            this.$Message.success("密码已成功修改!")
                            this.showChangePassword =  false
                        }
                    })
                }

            },
            reset(){
                for(let key in this.change){
                    this.change[key] = ""
                }
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
    .style2{
        width:100px;display: inline-block;text-align: left;
    }
    .style3{
        width:300px
    }
    .style4{
        margin:8px
    }
    .style5{
        width:80px;
        margin:10px 5px
    }
</style>
