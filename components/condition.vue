<template>
    <Row style="margin-top: 5px;">
        <template v-for="(item,index) in queryFields" >
            <i-col span="8" v-if="!modelObj[item].isTimeFormat" :style="style.icolStyle">
                <Label :style="style.conditionLabel" style="margin-left:15px;color:#333;font-weight:normal" v-html="getLabel(item,modelObj)" >
                </Label>
                <Cascader :data="getItemList(item,modelObj)" v-model="condition[item]" transfer placement="bottom-start"
                          v-if="modelObj[item].isCascade" clearable size="small" :style="style.conditionInput" change-on-select
                ></Cascader>
                <InputNumber  :precision="0" v-else-if="modelObj[item].isInteger"  :style="style.conditionInput" size="small"
                             v-model="condition[item]" :min="0"/>
                <InputNumber   v-else-if="modelObj[item].isDouble "  :style="style.conditionInput"
                              size="small" v-model="condition[item]" :min="0"/>
                <dateRange v-else-if="modelObj[item].isDateFormat || modelObj[item].isDateRange" v-model="condition[item]"></dateRange>
                <Select clearable filterable v-else-if="modelObj[item].dictType" :style="style.conditionInput" transfer
                        size="small" v-model="condition[item]" >
                    <Option v-for="itemTem in getItemList(item,modelObj)" :value="itemTem.value" :key="itemTem.value">{{ itemTem.label }}</Option>
                </Select>
                <Input v-else :style="style.conditionInput" size="small" clearable v-model.trim="condition[item]"/>
            </i-col>
            <i-col span="16" v-else :style="style.icolStyle">
                <Label :style="style.conditionLabel" style="margin-left:15px;color:#333;font-weight:normal" v-html="getLabel(item,modelObj)" >
                </Label>
                <dateRange  v-model="condition[item]" :isTimeFormat="true"></dateRange>
            </i-col>
        </template>
        <i-col span="24" style="text-align: center;">
            <i-button type='primary' size="small" @click="queryData" :style="style.queryButton" >查询</i-button>
            <i-button type='primary' size="small" @click="resetCondition" :style="style.queryButton" >重置</i-button>
        </i-col>
    </Row>
</template>

<script>
    const ormModel = require('@/store/ormModel')
    const {common} = require("rootPath/self_contained/proxy")
    const dictService = require("@/store/service/DictService")
    const commonStyle = require('@/views/style/common')
    const businessUtil = require('@/util/businessUtil')
    import dateRange from '@/views/components/common/dateRange'

    export default {
        components:{
            dateRange
        },
        data(){
            return {
                modelObj:ormModel[this.type].modelObj,
                style:{
                    ...commonStyle,
                    icolStyle:{
                        "margin-bottom":"8px"
                    }
                },
                condition:{}
            }
        },
        mounted(){
            for(let key of this.queryFields){
                this.condition[key] = null
            }
            //todo why this has to be added
            this.$emit('input',this.condition)
            this.style.conditionInput.width = '216px'
        },
        methods:{
            getItemList:businessUtil.getItemList,
            getLabel:businessUtil.getLabel,
            queryData(){
                this.$emit("queryData")
            },
            resetCondition(){
               let tem  = common.aryToObj(this.queryFields,"")

                for(let key of this.queryFields){
                    const {isTimeFormat,isDateFormat,isDateRange} = this.modelObj[key]
                    if(this.modelObj[key].isCascade){
                        tem[key] = []
                    }else if(isTimeFormat||isDateFormat||isDateRange){
                        tem[key] = ['','']
                    }
                }
                this.condition = tem
                this.$emit('resetCondition')

            },
        },
        name: "condition",
        props:{
            type:{
                type:String,
                required:true,
                validator(type){
                    return ormModel.hasOwnProperty(type)
                }
            },
            queryFields:{
                type:Array,
                required:true,
            },


        },
        watch:{
            condition:{
                //todo handler is not run every time ,and curVal = oldVal
                handler(curVal,oldVal){
                    this.$emit('input',curVal)
                },
                deep:true
            }
        }
    }
</script>

<style scoped>

</style>
