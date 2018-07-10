<template>
    <div style="display: inline-block" v-if="isTimeFormat">
        <DatePicker v-model="valueLocal[0]" size="small" type="datetime" transfer placeholder="请选择" :style="style"
                    transfer   :options="options0"
                    placement="bottom-start"  clearable ></DatePicker>
        ~
        <DatePicker
            v-model="valueLocal[1]" size="small" type="datetime" transfer placeholder="请选择":style="style"
            transfer  :options="options1"    placement="bottom-start"  clearable ></DatePicker>
    </div>
    <div style="display: inline-block" v-else>
        <DatePicker v-model="valueLocal[0]" size="small" type="date" transfer :placeholder="placeholder" :style="style"
          transfer   :options="options0"       placement="bottom-start"  clearable ></DatePicker>~<DatePicker
            v-model="valueLocal[1]" size="small" type="date" transfer :placeholder="placeholder":style="style"
                    transfer  :options="options1"    placement="bottom-start"  clearable ></DatePicker>
    </div>
</template>

<script>
    export default {
        name: "data-range",
        computed:{
            style(){
                let width = this.size?this.size+'px':104+'px'
                if(this.isTimeFormat){
                    width = '200px'
                }
                let result = {
                    "width":width
                }
                return result
            },
            options0(){
                const _this = this
                return {
                    disabledDate(date){
                        let result = false
                        let valueLocalEle = _this.valueLocal[1]
                        if(valueLocalEle){
                            result = date.getTime() > new Date(valueLocalEle).getTime()
                        }
                        return result
                    }
                }
            },
            options1(){
                const _this = this
                return {
                    disabledDate(date){
                        let result = false
                        let valueLocalEle = _this.valueLocal[0]
                        if(valueLocalEle){
                            result = date.getTime() < new Date(valueLocalEle).getTime()
                        }
                        return result
                    }
                }
            },
            placeholder(){
                let result = '请选择'
                if(this.size > 100){
                    result = 'yyyy-mm-dd'
                }
                return result
            }
        },
        data(){
            return{
                valueLocal:['','']
            }
        },
        methods:{

        },
        mounted(){

        },
        props:{
            size:{
                type:Number,
            },
            isTimeFormat:{
                type:Boolean,
                default:false
            },
            value:{
                type:Array
            }
        },
        watch:{
            valueLocal(val){
                this.$emit('input',val)
            },
            value(val){
                if(val){
                    if(val.join('') !== this.valueLocal.join('')){
                        let result = [val[0],val[1]]

                        for(let i=0;i<result.length;i++){
                            if(result[i]){
                                if(typeof result[i] === 'string'){
                                    result[i] = new Date(result[i])
                                }
                            }else{
                                result[i] = ''
                            }
                        }
                        this.valueLocal = result
                    }

                }else{
                    this.valueLocal = ['','']
                }
            }
        }
    }
</script>

<style scoped>

</style>
