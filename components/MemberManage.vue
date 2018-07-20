<template>
    <div>
        <div style="display:flex;justify-content: space-between;align-items: center">
            <pageSize :sizeOfPage="sizeOfPage" @sizeChange="sizeChange"
                      :totalRows="totalRows" :selectionCount="selection.length">
            </pageSize>
            <div style="margin-right:80px;margin-top: 20px">
                <Button type="primary" size="small" :style="style.functionButton" @click="openSaveModal('create')" v-if="!excludeAry.includes('add')">
                    新增
                </Button>
                <Button type="primary" size="small" :style="style.functionButton" @click="openSaveModal('modify')" v-if="!excludeAry.includes('modify')">
                    修改
                </Button>
                <Button type="primary" size="small" :style="style.functionButton" @click="openDeleteModal" v-if="!excludeAry.includes('delete')">
                    删除
                </Button>
            </div>
        </div>
    </div>

</template>

<script>
    export default {
        name: "member-mange",
        data(){
            return {
                currentPage:1,
                selection:[],
                sizeOfPage:10,
                totalRecords:[],
            }
        },
        methods:{
            sizeChange(val){
                this.selection = []
                this.currentPage=1
                this.sizeOfPage = (val===-1)?this.totalRows:val
            },
        }

    }
</script>

<style scoped>

</style>
