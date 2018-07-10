<template>
    <div style="display: flex;justify-content: flex-start;align-items: center;margin-top:10px">
        <div>
            显示
            <i-select v-model="size"  size="small" style="display: inline-block;width:65px;text-align: center;margin:0 5px">
                <Option v-for="option of options" :label="option.label" :value="option.value" :key="option.value">

                </Option>
            </i-select>条记录,共<span :style="style.count">{{this.totalRows}}</span>条记录<span v-show="selectionCount!==0">,已勾选<span :style="style.count">{{selectionCount}}</span>条记录
            </span>
        </div>

    </div>
</template>

<script>
    export default {
        name: "page-size",
        data(){
            return {
                options:[
                    {label:'10',value:10,},
                    {label:'20',value:20,},
                    {label:'50',value:50,},
                    {label:'100',value:100,},
                    {label:'全部',value:-1,},
                    ],
                size:this.sizeOfPage,
                style:{
                    count:{
                        'font-weight':'bold',
                        'margin':'0 2px'
                    }
                }
            }
        },
        props:{
            selectionCount:{
                type:Number,
                default:0
            },
            sizeOfPage:{
                type:Number,
                default:10,
                required:true
            },
            totalRows:{
                type:Number,
                required:true
            },

        },
        watch:{
            size(curVal,oldVal){
                this.$emit('sizeChange',curVal)
            }
        }
    }
</script>

<style scoped>

</style>
