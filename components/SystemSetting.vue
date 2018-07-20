<template>
    <div  >
        <div style="display: flex;justify-content: center">
            <div>
                <Card  style="width:600px;margin: 10px 10px;">
                    <p slot="title">
                        系统设置
                    </p>

                    <Row>
                        <i-col span="8">
                            <span style="float:right;margin-right: 10px;">公开IP:</span>
                        </i-col>
                        <i-col span="14">
                            <span style="margin-left: 20px;">
                                {{this.publicIp}}
                            </span>
                        </i-col>
                        <i-col span="2">
                            <Button size="small" type="primary" @click="method1">
                                修改
                            </Button>
                        </i-col>
                    </Row>


                </Card>
            </div>
            <Modal v-model="showModal" title="设置ip">
                <div style="text-align: center;margin-top: 40px" >
                    <div style="display:inline-block;">

                        <div style="text-align:center">
                            <span style="display: inline-block;width:80px">公开IP:</span>
                            <Input style="width:200px;display: inline-block" v-model.trim="ip" ref="ip"/>
                            <Button type="primary"  @click="save" style="margin:20px 10px;width:80px;display: inline-block;">保存</Button>

                        </div>
                        <div  style="text-align: center">
                            <span style="display: inline-block;width:80px"></span>
                        </div>
                    </div>
                </div>
                <div slot="footer"> </div>
            </Modal>
        </div>
    </div>

</template>

<script>

    const {httpPost} = require('../frontend/util')

    const ipRegex = /\b((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)(\.|$)){4}\b/
    export default {
        components: {},
        computed:{

        },
        data(){
            return {
                ip:"",
                showModal:false,
                publicIp:"",
                style:{
                    label:{
                        'display': 'inline-block',
                        'width':'180px',
                        "text-align":"right",
                        "margin-right":"5px",
                        "margin-top":"10px",
                        "color":"#505050"
                    },
                    content:{
                        'display': 'inline-block',
                        'margin-left':"30px",
                        "text-align":"left",
                        "width":"300px"
                    },
                    button:{
                        'float':'right',
                        'margin':'5px'
                    }
                },
            }
        },
        methods:{
            method1(){
                this.showModal=true
            },
            save(){
                if(ipRegex.test(this.ip)){
                    httpPost({
                        url:"/api/meta/changePublicIp",
                        param:{
                           publicIp:this.ip
                        },
                        successCb:(content)=>{

                            this.publicIp =  this.ip
                            this.showModal = false
                            this.$Message.success("公开IP地址设置成功")
                        }
                    })
                }else{
                    this.$Message.warning({
                        duration:4,
                        content:"输入的ip地址不合法,请重新输入"
                    })
                    this.$refs.ip.focus()

                }
            }
        },
        mounted(){
            httpPost({
                url:"/api/meta/getPublicIp",
                successCb:(content)=>{
                    const {publicIp} = content
                    this.publicIp =  publicIp
                    this.ip = publicIp
                }
            })
        },
        watch:{
        }
    }

</script>

<style scoped>

</style>
