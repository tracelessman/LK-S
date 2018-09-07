<template>
    <div v-show="isInited">
        <div style="margin:20px 30px" v-if="hasRoot" >
            <div style="background-color: rgb(241, 241, 241);padding:5px 10px;margin-bottom:20px;padding-right:30px">
                <Button @click='openSaveModal("create")' style="margin-right: 5px;width:100px" size="small" type="primary">新增子节点</Button>
                <Button @click='openSaveModal("modify")' style="margin-right: 5px;width:60px" size="small" type="primary">修改</Button>
                <Button @click='deleteRecord' style="margin-right: 5px;width:60px" size="small" type="primary">删除</Button>
                <Button @click='expandAll' style="margin-right: 5px;width:80px" size="small" type="primary">全部展开</Button>
            </div>
            <div style="margin:20px;float:left;display: inline-block">

                <Tree :data="treeData" empty-text=""  @on-select-change="onSelectChange" ></Tree>
            </div>
            <div v-show="this.selectedNode" style="margin-top: 10px;min-height:450px;padding-left: 20px;width:800px;border-left:1px dashed #dddee1;display: inline-block">
                <Tabs v-model="tabName" type="card" >
                    <TabPane name="memberList" label="组织成员">
                        <MemberManage :selectedNode="selectedNode" ></MemberManage>
                    </TabPane>
                </Tabs>
            </div>
        </div>
        <div v-else>
            <div style="margin:auto">
                <Card style="margin:50px auto;width:600px" title="请设置本组织名称">
                    <div style="text-align: center">
                        <div style="text-align: center">
                            <Input v-model.trim="orgName" style="width:300px;margin:20px" ref="orgName"/>
                            <Button type="primary" @click="setRoot">保存</Button>

                        </div>
                    </div>

                </Card>


            </div>
        </div>
        <Modal v-model="showSaveModal" width="660" :mask-closable="false" :title="action==='create'?'新增记录':'修改记录'">
            <div style="text-align: center;margin:20px">
                <span style="margin-right: 10px">组织节点名称:</span>
                <Input clearable style="width:300px" v-model.trim="nodeName" ref="nodeName"/>
            </div>
            <div slot="footer" style="overflow: auto">
                <i-col span="24" style="text-align: right;">
                    <i-button type='ghost' size="small" @click="showSaveModal=false" :style="style.queryButton" >取消</i-button>
                    <i-button type='primary' size="small" @click="save" :style="style.queryButton" >保存</i-button>
                </i-col>
            </div>
        </Modal>
        <Modal
                v-model="showDeleteModal"
                title="提示" >
            <p style="text-align: center;margin:20px 0;font-size: 1.2em">
                请确定是否要删除该节点和其所有子节点,以及相关联的授权记录?
            </p>
            <div slot="footer" style="overflow: auto">
                <i-col span="24" style="text-align: right;">
                    <i-button type='ghost' size="small"  @click="showDeleteModal=false" :style="style.queryButton" >取消</i-button>
                    <i-button type='primary' size="small"  @click="keepDelete" :style="style.queryButton" >确定</i-button>
                </i-col>
            </div>
        </Modal>
    </div>
</template>

<script>
    const style = require('../style/common')
    import MemberManage from './MemberManage'
    const {httpPost} = require('../frontend/util')
    const uuid = require('uuid')

    export default {
        components:{
            MemberManage
        },
        name: "org-manage",
        data(){
            return {
                orgName:"",
                hasRoot:false,
                isInited:false,
                tabName:"memberList",
                action:"",
                nodeName:"",
                selectedNode:null,
                showDeleteModal:false,
                showWarnModal:false,
                showSaveModal:false,
                style,
                treeData:[]
            }
        },
        methods:{
            openSaveModal(action){
                if(!this.selectedNode){
                    this.$Message.info('请先点击选中需要操作的行政区划')
                }else{
                    this.action = action
                    if(action === 'create'){
                        this.nodeName = ''
                    }else{
                        this.nodeName = this.selectedNode.title
                    }

                    this.showSaveModal = true
                    const _this = this
                    setTimeout(()=>{
                        _this.$refs.nodeName.focus()
                    },100)
                }
            },
            expandAll(){
                const  _expandAll = (ary)=>{
                    for(let ele of ary){
                        if(ele.hasOwnProperty('expand') && !ele.expand){
                            ele.expand = true
                        }
                        if(ele.hasOwnProperty('children')){
                            _expandAll(ele.children)
                        }
                    }
                }
                _expandAll(this.treeData)
                this.$Message.success('已经全部展开')
            },
            onSelectChange(option){
                this.selectedNode  = option[0]


            },
            keepSave(){

                if(this.action === 'create'){

                    const record = {
                        id:uuid(),
                        title:this.nodeName,
                        name:this.nodeName,
                        parentId:this.selectedNode.id,
                    }
                    const record2 = {
                        parentNode:this.selectedNode,
                        ...record
                    }

                    httpPost({
                        url:"/api/org/addOrg",
                        param:{
                            record
                        },
                        successCb:(content)=>{
                            const children = this.selectedNode.children || [];
                            children.push(record2)
                            this.$set(this.selectedNode, 'children', children);

                            this.showSaveModal = false
                            this.$Message.success('成功新增子节点')
                            this.$set(this.selectedNode,'expand',true)
                        }
                    })

                }else{
                    const org = {
                        name:this.nodeName,
                        id:this.selectedNode.id,

                    }

                    httpPost({
                        url:"/api/org/updateRecord",
                        param:{
                            record:org
                        },
                        successCb:(content)=>{
                            this.selectedNode.title = this.nodeName
                            this.showSaveModal =false
                            this.$Message.success('成功修改记录')
                        }
                    })
                }
            },
            save(){
                if(this.nodeName){
                    this.keepSave()

                }else{
                    this.$Message.info('请将行政区划名称填写完整')
                    this.$refs.areaName.focus()
                }

            },
            deleteRecord(){
                if(!this.selectedNode){
                    this.$Message.info('请先点击选中需要操作的行政区划')
                }else{
                    this.showDeleteModal = true
                }
            },
            setRoot(){
                if(!this.orgName){
                    this.$Message.warning("组织名称不能为空")
                }else{
                    httpPost({
                        url:"/api/org/setRoot",
                        param:{
                            orgName:this.orgName
                        },
                        successCb:(content)=>{
                            this.getTreeData()
                        }
                    })
                }
            },
            getTreeData(){

                httpPost({
                    url:"/api/org/getTreeData",
                    param:{

                    },
                    successCb:(content)=>{
                        const {length} = content

                        if(length === 0){
                            this.hasRoot = false
                        }else{
                            this.hasRoot = true

                            this.treeData = this.getTree(content)
                        }


                        this.isInited =  true
                    }
                })
            },

            getTree(ary){

                let top
                let idObj = {}

                ary = ary.map(ele=>{
                    let result = ele
                    result.title = ele.name
                    return result
                })

                for(let ele of ary){

                    if(ele.parentId){
                        if(!idObj[ele.parentId]){
                            idObj[ele.parentId] = []
                        }

                        idObj[ele.parentId].push(ele)
                    }else{
                        top = ele
                    }
                }
                for(let ele of ary){
                    const {id} = ele

                    if(idObj.hasOwnProperty(id)){
                        ele.expand = true
                        ele.children = idObj[id]
                        for(let kid of ele.children){
                            kid.parentNode = ele
                        }
                    }
                }
                const result = []
                if(top){
                    result.push(top)
                }
                return result
            },
            keepDelete(){
                this.showDeleteModal = false

                const idAry = []
                const _f = (obj)=>{
                    idAry.push(obj.id)
                    let {children} = obj
                    if(children){
                        for(let ele of children){
                            _f(ele)
                        }
                    }
                }

                _f(this.selectedNode)

                httpPost({
                    url:"/api/org/deleteRecordMultiple",
                    param:{
                        idAry
                    },
                    successCb:(content)=>{
                        let siblingAry = this.selectedNode.parentNode.children
                        let index
                        for(let i = 0;i < siblingAry.length;i++){
                            if(siblingAry[i].id === this.selectedNode.id){
                                index = i
                                break
                            }
                        }
                        this.selectedNode.parentNode.children.splice(index,1)
                        this.selectedNode = null
                        this.$Message.success('已经删除该节点及其所有子节点')
                    }
                })

            },

        },
        mounted(){
           this.getTreeData()
        }
    }
</script>

<style scoped>

</style>
