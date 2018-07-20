<template>
    <div  >
        <div style="display: flex;justify-content: center">
            <div>
                <Card  style="width:600px;margin: 20px 10px;overflow: auto">
                    <p slot="title">
                        系统设置
                    </p>

                    <Row>
                        <i-col span="8">
                            <span style="float:right;margin-right: 10px;">公开IP:</span>
                        </i-col>
                        <i-col span="14">
                            <span style="margin-left: 20px;">

                            </span>
                        </i-col>
                        <i-col span="2">
                            <Button size="small" type="primary" @click="">
                                修改
                            </Button>
                        </i-col>
                    </Row>


                </Card>
            </div>
            <Modal >
                <div style="text-align: center;margin-top: 40px" >
                    <div style="display:inline-block;text-align:left;width:350px">

                        <div style="margin:15px 0">
                        </div>
                        <div  style="overflow: auto;text-align: right">
                            <Button type="primary"  @click="" style="margin:40px 0px 10px 0;width:80px">保存</Button>
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
    export default {
        components: {},
        computed:{

        },
        data(){
            return {
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
        },
        mounted(){

        },
        watch:{
        }
    }

</script>

<style scoped>

</style>
