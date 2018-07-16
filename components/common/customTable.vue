<template>
    <div >
        <condition  v-model='condition'  :type="type" :queryFields="queryFieldsLocal"
                    @resetCondition="refreshTable" @queryData="queryData" :modelObj="modelObj" :dict="dict">
        </condition>
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
                <div style="display: inline-block" v-if="customButtonAry">

                </div>
                <template v-for="obj of customButtonAry" >
                    <Tooltip v-if="obj.content" :content="obj.content" placement="top-start"  :delay="obj.delay?obj.delay:100" transfer  >
                        <Button v-if="obj.iconType" type="ghost" size="small" :style="style.functionButton" @click="customFunc(obj.click)">
                            <Icon :type="obj.iconType" size="14"></Icon>
                        </Button>
                        <Button v-else type="primary" size="small" :style="style.functionButton" @click="customFunc(obj.click)">
                            {{obj.text}}
                        </Button>
                    </Tooltip>
                    <template v-else>
                        <Button v-if="obj.iconType" type="ghost" size="small" :style="style.functionButton" @click="customFunc(obj.click)">
                            <Icon :type="obj.iconType" size="14"></Icon>
                        </Button>
                        <Button v-else type="primary" size="small" :style="style.functionButton" @click="customFunc(obj.click)">
                            {{obj.text}}
                        </Button>
                    </template>
                </template>

            </div>
        </div>
        <i-col span="24" style="margin-top: 10px;">
            <i-table border  highlight-row @on-current-change="currentChange" :loading="loading"
                     @on-selection-change="selectionChange" ref="table"
                     size="small" :data="recordsDisplayProcessed" :columns="tableColumns">
            </i-table>
            <div style="margin: 10px;overflow: hidden">
                <div style="float: right;" v-if="totalRows>0">
                    <Page :total="totalRows" :current="currentPage" :page-size="sizeOfPage" @on-change="changePage" size="small"></Page>
                </div>
            </div>
        </i-col>
        <Modal  v-model="showCheckModal" :width="modalWidth">
            <h3 slot="header">
                查看记录
            </h3>
            <div style="overflow: auto">
                <div  v-if="classification" >
                    <Tabs v-model="tabsValue">
                        <TabPane  v-for="(val,key) in classification" :name="key" :label="val.title" :key="key">
                            <template  v-for="(item,index) in val.keys"  v-if="modelObj[item].displayPage.includes('check')" >
                                <i-col span="12" style="" :style="style.colStyle" v-if="!modelObj[item].isTextArea">
                                    <Label  style="margin-left:25px;" :style="style.conditionLabel" v-html="getLabel(item,modelObj)" >
                                    </Label>

                                    <Label style="display: inline-block;text-align: left" :style="style.checkAddInput">
                                        {{valueRecordCheck[item]?valueRecordCheck[item]:'----'}}
                                    </Label>
                                </i-col>
                                <i-col span="24" style="" :style="style.colStyle" v-else>
                                    <Label :style="style.conditionLabel" style="margin-left:25px" v-html="getLabel(item,modelObj)" >
                                    </Label>

                                    <Label style="display: inline-block;text-align: left;width:850px" >
                                        {{valueRecordCheck[item]?valueRecordCheck[item]:'----'}}
                                    </Label>
                                </i-col>

                            </template>
                        </TabPane>
                    </Tabs>
                </div>
                <Row style="margin: 5px auto;" v-else>
                    <template v-for="(item,index) in allFields" v-if="modelObj[item].displayPage.includes('check')" >
                        <i-col span="24" style="text-align: center;word-break: break-all" >
                            <Label  :style="style.conditionLabel" style="margin-left:15px" v-html="getLabel(item,modelObj)" >
                            </Label>

                            <Label style="display: inline-block;text-align: left" :style="style.checkAddInput">
                                {{valueRecordCheck[item]?valueRecordCheck[item]:'----'}}
                            </Label>
                        </i-col>
                        <i-col span="24" >
                            <div :style="style.insertDiv">
                            </div>
                        </i-col>
                    </template>
                </Row>
            </div>
            <div slot="footer">
            </div>
        </Modal>
        <Modal :mask-closable="false" v-model="showSaveModal" :width="modalWidth" style="overflow: auto">
            <h3 slot="header">
                {{this.action === 'create'?'新增':'修改'}}记录
            </h3>
            <div v-if="classification">
                <Tabs v-model="tabsValue">
                    <TabPane  v-for="(val,key) in classification" :name="key" :label="val.title" :key="key">
                        <template  v-for="(item,index) in val.keys" v-if="shouldShow(item)" >
                            <template v-if="!modelObj[item].isTextArea">
                                <i-col span="12" :style="style.colStyle" >
                                    <Label  style="margin-left:25px"  :style="[style.conditionLabel]">
                                        <strong style="color:red;margin-right:3px;font-size: 1.3em;vertical-align: middle"
                                                v-show="modelObj[item].hasOwnProperty('allowNull')&&!modelObj[item].allowNull">*</strong>{{modelObj[item].title}}</Label>
                                    <Cascader :data="getItemList(item,modelObj)" v-model="valueRecordSave[item]" transfer placement="bottom-start"
                                              v-if="modelObj[item].isCascade" clearable size="small" :style="style.checkAddInput" change-on-select
                                    >

                                    </Cascader>
                                    <InputNumber :ref="item" :precision="0" v-else-if="modelObj[item].isInteger"  :style="style.checkAddInput" size="small" clearable
                                                 v-model="valueRecordSave[item]" :min="0"/>
                                    <InputNumber  :ref="item" v-else-if="modelObj[item].isDouble "  :style="style.checkAddInput" clearable
                                                  size="small" v-model="valueRecordSave[item]" :min="0"/>
                                    <DatePicker v-else-if="modelObj[item].isDateRange" size="small" type="daterange" transfer placeholder="请选择"
                                                placement="bottom-start" clearable  :options="getDatePickerOptions(item)"
                                                :style="style.checkAddInput" v-model="valueRecordSave[item]"></DatePicker>
                                    <DatePicker v-else-if="modelObj[item].isDateFormat" size="small" type="date" transfer placeholder="yyyy-mm-dd"
                                                placement="bottom-start" clearable  :options="getDatePickerOptions(item)"
                                                :style="style.checkAddInput" v-model="valueRecordSave[item]"></DatePicker>
                                    <DatePicker v-else-if="modelObj[item].isTimeFormat" size="small" type="datetime" transfer placeholder="请选择"
                                                placement="top-end"  clearable  :options="getDatePickerOptions(item)"
                                                :style="style.checkAddInput" v-model="valueRecordSave[item]"></DatePicker>
                                    <Select clearable  filterable v-else-if="modelObj[item].dictType" :style="style.checkAddInput"
                                            style="text-align: left" transfer
                                            size="small" v-model="valueRecordSave[item]" >
                                        <Option v-for="itemTem in getItemList(item,modelObj)" :value="itemTem.value" :key="itemTem.value">{{ itemTem.label }}</Option>
                                    </Select>
                                    <div v-else-if="modelObj[item].isArray" :style="style.checkAddInput" class="textArea">
                                        <TagGroup v-model="valueRecordSave[item]">

                                        </TagGroup>
                                    </div>

                                    <Input clearable :ref="item" v-else :style="style.checkAddInput" size="small" v-model.trim="valueRecordSave[item]"/>
                                </i-col>
                            </template>

                            <template  v-else>
                                <i-col span="24" :style="style.colStyleTextArea" >
                                    <Label  style="margin-left:25px"  :style="[style.conditionLabel]">
                                        <strong style="color:red;margin-right:3px;font-size: 1.3em;vertical-align: middle"
                                                v-show="modelObj[item].hasOwnProperty('allowNull')&&!modelObj[item].allowNull">*</strong>{{modelObj[item].title}}</Label>
                                    <Input clearable autosize type="textarea" :rows="2" :ref="item"  style="display:inline-block;width:700px"
                                           size="small" v-model.trim="valueRecordSave[item]"/>

                                </i-col>

                            </template>

                        </template>
                        <i-col span="24" >
                            <div :style="style.insertDiv">
                            </div>
                        </i-col>

                    </TabPane>

                </Tabs>
            </div>
            <div style="overflow: auto" v-else>
                <template v-for="(item,index) in allFields"   v-if="shouldShow(item)" >
                    <i-col span="24" style="text-align: center">
                        <Label  style="margin-left:25px;"  :style="[style.conditionLabel]">
                            <strong style="color:red;margin-right:3px;font-size: 1.3em;vertical-align: middle"
                                    v-show="modelObj[item].hasOwnProperty('allowNull')&&!modelObj[item].allowNull">
                                *</strong>{{modelObj[item].title}}</Label>
                        <Cascader :data="getItemList(item,modelObj)" v-model="valueRecordSave[item]" transfer placement="bottom-start"
                                  v-if="modelObj[item].isCascade" clearable size="small" :style="style.checkAddInput" change-on-select
                        >

                        </Cascader>
                        <InputNumber :ref="item" :precision="0" v-else-if="modelObj[item].isInteger"  :style="style.checkAddInput" size="small"
                                     v-model="valueRecordSave[item]" :min="0"/>
                        <InputNumber  :ref="item" v-else-if="modelObj[item].isDouble "  :style="style.checkAddInput"
                                      size="small" v-model="valueRecordSave[item]" :min="0"/>
                        <dateRange v-else-if="modelObj[item].isDateRange"  :size="147"
                                   v-model="valueRecordSave[item]"></dateRange>
                        <DatePicker v-else-if="modelObj[item].isDateFormat" size="small" type="date" transfer placeholder="yyyy-mm-dd"
                                    placement="bottom-start" clearable  :options="getDatePickerOptions(item)"
                                    :style="style.checkAddInput" v-model="valueRecordSave[item]"></DatePicker>
                        <DatePicker v-else-if="modelObj[item].isTimeFormat" size="small" type="datetime" transfer placeholder="请选择"
                                    placement="bottom-start"  clearable  :options="getDatePickerOptions(item)"
                                    :style="style.checkAddInput" v-model="valueRecordSave[item]"></DatePicker>
                        <Select clearable filterable v-else-if="modelObj[item].dictType" :style="style.checkAddInput"  :ref="item"
                                style="text-align: left" transfer
                                size="small" v-model="valueRecordSave[item]" >
                            <Option v-for="itemTem in this.dict[modelObj[item].dictType]" :value="itemTem.value" :key="itemTem.value">{{ itemTem.label }}</Option>
                        </Select>
                        <div v-else-if="modelObj[item].isArray" :style="style.checkAddInput" class="textArea">
                            <TagGroup v-model="valueRecordSave[item]">

                            </TagGroup>
                        </div>

                        <Input clearable autosize type="textarea" :rows="4" :ref="item" v-else-if="modelObj[item].isTextArea" :style="style.checkAddInput"

                               size="small" v-model.trim="valueRecordSave[item]"/>
                        <Input clearable :ref="item" v-else :style="style.checkAddInput" size="small" v-model.trim="valueRecordSave[item]"/>
                    </i-col>
                    <i-col span="24" >
                        <div :style="style.insertDiv">
                        </div>
                    </i-col>
                </template>
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
                请确定是否要删除选中的{{this.selection.length}}条记录?
            </p>
            <div slot="footer" style="overflow: auto">
                <i-col span="24" style="text-align: right;">
                    <i-button type='ghost' size="small"  @click="showDeleteModal=false" :style="style.queryButton" >取消</i-button>
                    <i-button type='primary' size="small"  @click="deleteRecord" :style="style.queryButton" >确定</i-button>
                </i-col>
            </div>
        </Modal>
    </div>
</template>
<script>
    const _ = require("lodash")

    import pageSize from './pageSize'
    import condition from './condition'
    import TagGroup from './TagGroup'
    import {Button} from 'iview'
    import iviewUtil from '../../frontend/util/iviewUtil'
    const commonStyle = require('../../style/common')
    import  businessUtil from './businessUtil'

    const uuidV4 = require('uuid/v4')
    import dateRange from './dateRange'

    export default {
        components:{
            condition,
            pageSize,
            TagGroup,
            dateRange
        },
        computed: {
            allFields(){
                return iviewUtil.getCertainFields(this.modelObj)
            },
            availableAry(){
                let availableAry = []

                for(let field of this.allFields){

                    let fieldObj = this.modelObj[field]
                    const {title} = fieldObj
                    availableAry.push({
                        label:title,
                        value:field
                    })
                }
                return availableAry
            },
            modalWidth(){
                return this.classification||"600"
            },
            recordsDisplayRaw() {
                let start = (this.currentPage - 1) * this.sizeOfPage;
                let finish = this.currentPage * this.sizeOfPage;
                if (finish > this.totalRows) {
                    finish = this.totalRows
                }
                let displayAry = this.totalRecords.slice(start, finish)

                return displayAry
            },
            recordsDisplayProcessed() {
              let  result = this.recordsDisplayRaw.map((ele)=>{
                   return  businessUtil.rawDataDisplay(ele,this.modelObj)
                })

                return result
            },
            tableColumns() {
                const _this = this
                let columns = [
                    {
                        type: 'selection',
                        width: 60,
                        align: 'center',
                    },
                    {
                        type: 'index',
                        width: 60,
                        align: 'center'
                    },
                ]

                for(let ele of this.showingFieldsLocal){
                    let field = this.modelObj[ele]
                    let column = {
                        title:field.title,
                        key:ele,
                    }
                    columns.push(column)
                }
                const commonActionSetting = {
                    title: '操作', key: 'action',  align: 'center',
                }
                const {operation} = this
                if(operation){
                    columns.push({
                        ...commonActionSetting,
                        width:operation.width,
                        render:operation.getRender(this)
                    })
                }else{
                    columns.push({
                        ...commonActionSetting,
                        width: 150,
                        render: (h, params) => {
                            let onClick = ()=>{
                                            _this.initTab()
                                            _this.valueRecordCheck = params.row
                                            _this.showCheckModal = true
                                            _this.action = 'check'

                                        }
                           return (
                               <Button size="small" type="primary" onClick={onClick}>
                                   查看
                               </Button>
                           )
                        }
                    })
                }
                iviewUtil.addCommonSetting(columns, {sortable: true,})
                return columns;
            },
            totalRows() {
                return this.totalRecords.length
            },
        },
        data(){
            return {
                action:'',
                authorizationCode:'',
                classification:this.ormModel[this.type].classification,
                condition:{},
                currentPage:1,
                iviewUtil,
                loading:true,
                modalWidthInfo:660,
                modelObj:this.ormModel[this.type].modelObj,
                queryFieldsLocal:this.queryFields?this.queryFields:[],
                selectedRecordIndex:-1,
                selection:[],
                showAttachmentModal:false,
                showCheckModal:false,
                showDeleteModal:false,
                showExportModal:false,
                showImportModal:false,
                showingFieldsLocal:[],
                showingFieldsModify:[],
                showSaveModal:false,
                sizeOfPage:10,
                service:this.ormService[this.type],
                style:{
                    ...commonStyle,
                    colStyle:{
                        "line-height":"28px",
                        "margin":"3px 0"
                    },
                    colStyleTextArea:{
                        "margin":"6px 0"
                    },
                    inputMimic:{

                        "display": "inline-block",
                        "padding": "1px 7px",
                        "height": "24px",
                        "border-radius": "3px",
                        "border": "1px solid #dddee1"
                    },
                },
                tableTitle:this.ormModel[this.type].tableTitle,
                tabsValue:'',
                totalRecords:[],
                valueRecordCheck:{},
                valueRecordSave:iviewUtil.initValueRecordSave(this.ormModel[this.type].modelObj),
                yearParam:null
            }
        },
        methods:{
            changePage(index) {
                this.selectedRecordIndex = -1
                this.currentPage = index;
            },
            currentChange(currentRow,oldRow){
               this.selectedRecordIndex = currentRow.indexOfTotalRecords
            },
            customFunc(func){
                func({
                    _this:this
                })
            },
            deleteRecord(){

                this.service.deleteRecordMultiple(this.selection).then(()=>{
                    this.$Message.info("删除记录成功!")
                    this.refreshTable()
                    this.showDeleteModal = false
                    this.selection = []
                }).catch(err=>{
                    this.showDeleteModal = false
                    if(typeof err === 'string'){
                        this.$Message.error({
                            content:err,
                            duration:4
                        })
                        this.setTimeoutWithThis({
                            timeout:1000*2,
                            func:(_this)=>{
                                _this.refreshTable()
                            }
                        })

                    }else{
                        this.$Message.error('删除记录失败')
                    }
                })
            },
            getDatePickerOptions(field){
                return iviewUtil.getDatePickerOptions(field,this.valueRecordSave,this.modelObj)
            },
            getItemList(queryField){
                return this.dict[this.modelObj[queryField].dictType]
            },
            getLabel:businessUtil.getLabel,
            initTab(){
                if(this.classification){
                    this.tabsValue = Object.keys(this.classification)[0]
                }
            },
            openDeleteModal(){
                if(this.selection.length === 0){
                    this.$Message.info('请先在复选框勾选需要删除的记录')
                }else{
                    this.showDeleteModal = true
                }
            },
            openSaveModal(action){
                this.action = action
                this.initTab()
                this.valueRecordSave = iviewUtil.initValueRecordSave({modelObj:this.modelObj})
                if(action === 'modify'){


                    if(this.selectedRecordIndex === -1){
                        this.$Message.info('请点击选中需要修改的那行记录')
                    }else{
                        this.valueRecordSave = _.cloneDeep(this.totalRecords[this.selectedRecordIndex])
                        this.openSaveModalModifyInit()
                    }
                }else{
                    this.showSaveModal = true
                }
            },
            openSaveModalModifyInit(){

                this.showSaveModal = true
                // just workaround for armyType and its dict update
                let armyType = this.$refs.armyType

                if(armyType){
                    if(armyType instanceof Array){
                        armyType = armyType[0]
                    }
                    if(this.valueRecordSave.armyType){
                        armyType.$nextTick(()=>{
                            this.ormModel.armyType.modelSequelized.findOne({
                                where:{
                                    id:this.valueRecordSave.armyType
                                }
                            }).then(record=>{
                                armyType.query = record.content
                                for(let ele of armyType.$children[2].$children){

                                    if(ele.value === this.valueRecordSave.armyType){
                                        ele.searchLabel = record.content
                                        break
                                    }
                                }
                            })

                        })
                    }
                }
            },
            queryData(){
                this.loading = true
                this.service.queryByCondition(this.condition).then((records)=>{
                    this.refreshTableByData(records)
                    this.loading = false
                })
            },
            refreshTable(){
                this.loading = false
                // this.service.getAllRecords().then((records)=>{
                //     this.refreshTableByData(records)
                //     this.loading = false
                // })
            },
            refreshTableByData(records){
                records = JSON.stringify(records);
                records = JSON.parse(records);

                this.totalRecords = records
                this.totalRecords.forEach((ele,index)=>{
                    ele.indexOfTotalRecords = index
                })
                this.currentPage = 1
                this.selection = []
                this.selectedRecordIndex = -1
            },
            save(){

                let param = {
                    modelObj:this.modelObj,
                    valueObj:this.valueRecordSave,
                    _this:this,
                    classification:this.classification,
                    key:this.type
                }
                if(!iviewUtil.passValidation(param)){
                    return
                }

                let promiseAry = []
                for(let key in this.valueRecordSave){
                    const fieldObj = this.modelObj[key]
                    if(!fieldObj){
                        continue
                    }
                    const value = this.valueRecordSave[key]
                    const {unique} = fieldObj
                    if(unique && value){
                        let where = {}
                        where[key] = value

                        let promise = this.service.queryExact(where)
                        promise.key = key
                        promiseAry.push(promise)
                    }
                }
                Promise.all(promiseAry).then(resultAry=>{
                    for(let i=0;i<resultAry.length;i++){
                        if(resultAry[i].length > 0 ){
                            const warn = ()=>{
                                this.$Message.info(`${this.modelObj[promiseAry[i].key].title}有重复记录, 请重新输入`)
                                iviewUtil.focus(this,promiseAry[i].key)
                            }
                            if(this.action === 'modify'){
                               let notSelfSameValue = resultAry[i].find(ele=>{
                                   return ele.id !== this.valueRecordSave.id
                                })
                                if(notSelfSameValue){
                                    warn()
                                    return
                                }
                            }else{
                                warn()
                                return
                            }
                        }
                    }

                    if(this.action === 'create'){

                        this.service.addRecord(this.valueRecordSave).then((record)=>{

                            this.refreshTable()
                            this.showSaveModal = false
                            this.valueRecordSave = iviewUtil.initValueRecordSave(this.modelObj)
                            this.$Message.info('成功新增记录!')
                        }).catch(err=>{
                            this.$Message.error('新增记录失败!')
                            console.log(err.message)
                            console.log(err)
                        })
                    }else{
                        this.service.updateRecord(this.valueRecordSave).then((record)=>{

                            let clone =  _.cloneDeep(this.valueRecordSave)

                            for(let key in clone){
                                this.totalRecords[this.selectedRecordIndex][key] = clone[key]
                            }
                            this.showSaveModal = false
                            this.selectedRecordIndex = -1
                            this.$Message.info('成功修改记录!')
                        }).catch(err=>{
                            console.log(err)
                            this.$Message.error('修改记录失败!')
                        })

                    }
                })


            },
            selectionChange(selection){
                this.selection = selection
            },
            setTimeoutWithThis(option){
                const {timeout,func} = option
                const _this = this
                setTimeout(()=>{
                    func(_this)
                },timeout)
            },
            shouldShow(item){
                return this.modelObj[item].displayPage.includes(this.action)
            },
            sizeChange(val){
                this.selection = []
               this.currentPage=1
               this.sizeOfPage = (val===-1)?this.totalRows:val
            },
            test(val){

            },
        },
        mounted(){
            if(this.showingFields){
                this.showingFieldsLocal = this.showingFields
            }else{
                this.showingFieldsLocal = iviewUtil.getCertainFields(this.modelObj,['region']).filter((field)=>{
                    return !this.modelObj[field].isLong
                })
            }
            if(!this.queryFields){
                this.queryFieldsLocal = iviewUtil.getCertainFields(this.modelObj,['region']).filter((field)=>{
                    return !this.modelObj[field].isLong
                })
            }
            this.initTab()
            this.style.conditionLabel.width = '70px'

            this.refreshTable()


        },
        name: "custom-table",
        props:{
            customButtonAry:{
                type:Array,
                default:()=>{
                    return []
                }
            },
            operation:{
                type:Object,
            },
            queryFields:{
                type:Array,
            },
            type:{
                type:String,
                required:true,

            },
            showingFields:{
                type:Array,

            },
            excludeAry:{
                type:Array,
                default:()=>{
                    return []
                }
            },
            ormModel:{
                type:Object,
                required:true,
            },
            ormService:{
                type:Object,
                required:true,
            },
            dict:{
                type:Object,
                required:true,
            }

        },
    }
</script>

<style scoped>
    .textArea{
        display: inline-block;
        border: 1px solid #dddee1;
        min-height: 80px;
        border-radius: 3px;
        transition: border .2s ease-in-out,background .2s ease-in-out,box-shadow .2s ease-in-out;
    }
</style>
