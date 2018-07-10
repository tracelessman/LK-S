<template>
    <div >
        <Tag v-for="item in aryVal" :key="item" @on-close="handleClose" type="border"
             :name="item" closable color="blue">
            {{item}}
        </Tag>
        <div style="margin:10px auto">
            <Input size="small" style="width:90%" v-model="addItem" ref="addItem"
                   placeholder="新增内容"
            />
            <div style="margin:10px auto">
                <Button icon="ios-plus-empty" type="dashed" size="small" @click="handleAdd">添加</Button>
            </div>
        </div>
    </div>
</template>

<script>
    const _ = require('lodash')
    export default {
        computed:{
            aryVal(){
                return this.value?this.value:[]
            }
        },
        data(){
           return {
               addItem:""
           }
        },
        methods:{
            handleAdd(){
                if(!this.addItem){
                    this.$Message.info('请将要添加的条目补充完整')
                    this.$refs.addItem.focus()
                }else if(this.aryVal.includes(this.addItem)){
                    this.$Message.info('要添加的条目已经存在')
                    this.$refs.addItem.focus()
                }else{
                    let tem = _.cloneDeep(this.aryVal)
                        tem.push(this.addItem)
                    this.$emit('input',tem)
                    this.addItem = ''
                }
            },
            handleClose(event,name){
                let aryTem = _.cloneDeep(this.aryVal)
                const index = aryTem.indexOf(name)
                aryTem.splice(index, 1)
                this.$emit('input',aryTem)
            }
        },
        mounted(){
        },
        name: "tag-group",
        props:{
            value:{
                required:true,
                default:()=>{
                    return []
                }
            },

        },
        watch:{
            value(){
                this.addItem = ''
            }
        }
    }
</script>

<style scoped>

</style>
