<template>
    <div >
        <condition  v-model='condition'  :type="type" :queryFields="queryFieldsLocal"
                    @resetCondition="refreshTable" @queryData="queryData">
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
                <Tooltip content="下发年度参数" placement="top-start"  :delay="100" transfer v-if="!excludeAry.includes('distribute')">
                    <Button type="primary" size="small" :style="style.functionButton" @click="clickDistribute" >
                        下发
                    </Button>
                </Tooltip>
                <Tooltip content="导入年度参数" placement="top-start"  :delay="100" transfer v-if="!excludeAry.includes('import')">
                    <Button type="primary" size="small" :style="style.functionButton" @click="authorizationCode='';showImportModal=true" >
                        导入
                    </Button>
                </Tooltip>
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

                <!--<Tooltip content="表格数据转换excel" placement="top-start"  :delay="800" transfer>-->
                    <!--<Button type="ghost" size="small" :style="style.functionButton" @click="exportData" v-if="!excludeAry.includes('export')">-->
                        <!--<Icon type="ios-paper-outline" size="13"></Icon>-->
                    <!--</Button>-->
                <!--</Tooltip>-->

                <!--<Button type="primary" size="small" :style="style.functionButton" @click="test">-->
                    <!--test-->
                <!--</Button>-->
                <!--<Button type="primary" size="small" :style="style.functionButton" @click="$refs.table.selectAll(true)">-->
                    <!--全选-->
                <!--</Button>-->
                <!--<Button type="primary" size="small" :style="style.functionButton">-->
                    <!--反选-->
                <!--</Button>-->

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
                            <template  v-for="(item,index) in val.keys"  v-if="!modelObj[item].hiddenFromCheck" >
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
                    <div style="display:block;float: right;width: 600px;margin-top: 25px;">
                        <span style="margin-left: 15px;">录入日期:</span>
                        <!--inputTime not tansfered-->
                        <Label :style="style.inputMimic" style="width: 120px;height: 22px;"   placement="right-end">{{iviewUtil.local(valueRecordCheck.inputTime)}}</Label>
                        <span style="margin-left: 15px;">填表人:</span>
                        <Label :style="style.inputMimic" style="width: 120px;" >
                            {{valueRecordCheck.inputPerson}}
                        </Label>
                        <span style="margin-left: 15px;">负责人:</span>
                        <Label :style="style.inputMimic" style="width: 120px;" >
                            {{valueRecordCheck.checkPerson}}
                        </Label>
                    </div>
                </div>
                <div v-else-if="hasEditor" >
                    <div style="overflow: auto">
                        <template  v-for="(item,index) in allFields" v-if="!modelObj[item].hiddenFromCheck">
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
                    </div>
                    <div style="float:left;margin-top:25px;margin-left:30px;">
                        <Button size="small" @click="openAttachmentModal" style="margin-right:5px">附件</Button>
                    </div>
                    <div  style="margin:25px;padding-top: 10px;clear:both">

                        <div v-html="documentDataCheck" style="border:1px solid #e0e0e0;padding:20px 60px ;min-height: 400px">
                        </div>
                    </div>

                </div>
                <Row style="margin: 5px auto;" v-else>
                    <template v-for="(item,index) in allFields" v-if="!modelObj[item].hiddenFromCheck" >
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
                        <template  v-for="(item,index) in val.keys" v-if="!modelObj[item].isComputed" >
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
                <div style="border-top: solid 1px #f6f6f6;padding-top:20px;margin-bottom:25px">
                        <div style="display: inline-block;float: left;width: 200px;" >
                            <span style="display: inline-block;margin-left: 20px;">注：带*为必填内容</span>
                        </div>
                        <div style="display:block;float: right;width: 600px;margin-top: 5px;">
                            <span style="margin-left: 15px;">录入日期:</span>
                            <DatePicker type="date" placeholder="yyyy-mm-dd" style="width: 120px;height: 22px;" placement="right-end" size="small" transfer v-model="valueRecordSave.inputTime"></DatePicker>
                            <span style="margin-left: 15px;">填表人:</span>
                            <Input clearable size="small" style="width: 120px;"   v-model.trim="valueRecordSave.inputPerson"/>
                            <span style="margin-left: 15px;">负责人:</span>
                            <Input clearable size="small" style="width: 120px;"  v-model.trim="valueRecordSave.checkPerson"/>
                        </div>
                </div>
            </div>
            <div v-else-if="hasEditor" style="margin-top:5px">
                <div style="margin:5px;overflow: auto">
                    <template  v-for="(item,index) in allFields" v-if="!modelObj[item].isComputed" >
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
                                <Select clearable filterable  v-else-if="modelObj[item].dictType" :style="style.checkAddInput"
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
                    <div style="margin:25px auto;width:950px;overflow: auto">
                        <div style="float:left;margin-top:25px;margin-left:30px">
                            <Button size="small" @click="insertImg" style="margin-right:5px">插入图片</Button>
                            <Button size="small" @click="openAttachmentModal" style="margin-right:5px">添加附件</Button>
                        </div>
                        <iframe src="static/editor.html" id="iframe"  frameBorder="0"
                                style="width:95%;margin:5px 20px;height:800px">
                        </iframe>
                    </div>
                </div>
            </div>
            <div style="overflow: auto" v-else>
                <template v-for="(item,index) in allFields" v-if="!modelObj[item].isComputed" >
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
                            <Option v-for="itemTem in dictService.dicts[modelObj[item].dictType]" :value="itemTem.value" :key="itemTem.value">{{ itemTem.label }}</Option>
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
        <Modal v-model="showExportModal" title="导出须知">
            <div style="text-align: center;margin:20px 0;font-size: 1.2em">
                <div>
                    <span style="margin-right: 10px">
                        年度参数:
                    </span>
                    <DatePicker type="year" size="small" clearable  transfer placeholder="yyyy"
                                style="width:220px" v-model="yearParam"/>
                </div>
                <div style="margin-top:25px;font-size: 0.9em;color:#2d8cf0">
                    导出数据库数据文件后请勿修改,以免无法再导入其他系统!
                </div>

            </div>
            <div slot="footer" style="overflow: auto">
                <div style="text-align: right;">
                    <i-button type='ghost' size="small"  @click="showExportModal=false" :style="style.queryButton" >取消</i-button>
                    <i-button type='primary' size="small"  @click="distribute" :style="style.queryButton" >确定</i-button>
                </div>
            </div>
        </Modal>
        <Modal v-model="showAttachmentModal" title="附件管理" :width="800" :mask-closable="this.action==='check'">
            <div>
                <div style="text-align:left;margin:20px 20px 10px 15px">
                    <Button type="primary" size="small" v-show="this.action !== 'check' "
                            :style="style.functionButton" @click="uploadAttachment"  >
                        上传附件
                    </Button>
                    <!--<Button type="primary" size="small"-->
                            <!--:style="style.functionButton" @click="openAttachmentFolder"  >-->
                        <!--打开附件文件夹-->
                    <!--</Button>-->
                </div>
                <i-table border  highlight-row size="small" :data="tableDataAttachment" :columns="tableColumnsAttachment" style="margin-top: 10px;">

                </i-table>
            </div>
            <div slot="footer" style="overflow: auto">
            </div>
        </Modal>
        <Modal v-model="showImportModal" title="导入年度参数" :width="700">
            <div style="text-align: center;margin:20px 0;font-size: 1.2em">
                <div style="">
                    <Tooltip  transfer
                             style="margin-right: 2px;" placement="top-start">
                        <div slot="content" style="white-space: normal;">
                            机器特征码请以管理员身份登录后在系统设置中获得,再发送给授权系统获取授权码
                        </div>
                        <Icon size="20" type="information-circled" style="vertical-align: text-top"></Icon>
                    </Tooltip>
                    <span style="margin-right: 10px">
                        年度参数授权码:
                    </span>
                    <Input  size="small" clearable
                            style="width:360px" v-model.trim="authorizationCode" @keyup.native.enter="importData"/>

                </div>



            </div>
            <div slot="footer" style="overflow: auto">
                <div style="text-align: right;">
                    <i-button type='ghost' size="small"  @click="showImportModal=false" :style="style.queryButton" >取消</i-button>
                    <i-button type='primary' size="small"  @click="importData" :style="style.queryButton" >确定</i-button>
                </div>
            </div>
        </Modal>
    </div>
</template>
<script>
    const _ = require("lodash")
    const crypto = require('crypto')
    const csv = require('csv')
    const {stringify,parse} = csv
    const AdmZip = require('adm-zip')
    const archiver = require('archiver')

    import pageSize from '@/views/components/common/pageSize'
    import condition from '@/views/components/common/condition'
    import TagGroup from '@/views/components/common/TagGroup'
    import {Button} from 'iview'

    const ormModel = require('@/store/ormModel')
    const ormService = require('@/store/ormService')
    const dictService = require("@/store/service/DictService")
    const yearService = require("@/store/service/YearService")
    const proxy = require("rootPath/self_contained/proxy")
    const {iviewUtil,common} = proxy
    const commonStyle = require('@/views/style/common')
    const businessUtil = require('@/util/businessUtil')
    const {dialog,shell} = require('electron').remote
    const other = require('@/util/other')
    const dataTransport = require('@/util/dataTransport')
    const fs = require('fs')
    const fse = require('fs-extra')
    const path = require('path')
    const uuidV4 = require('uuid/v4')
    const logger = require('rootPath/src/logger').getLogger('customTable','render')
    import dateRange from '@/views/components/common/dateRange'
    const util = require('util')
    const Sequelize = require('sequelize')
    const {Op} = Sequelize

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
            attachmentFolderPath(){
                let result = ''
                if(this.htmlFolder){
                    result = businessUtil.getAttachmentFolderPath(this.htmlFolder)
                }
                fse.ensureDirSync(result)
                return result
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
            documentDataCheck(){
                let result = `
                <div style="display: flex;justify-content: center;margin-top: 100px">
                    本文档只包含附件,请查看附件
                </div>
`
                const {documentId} = this.valueRecordCheck

                if(documentId) {
                    const htmlFilePath = businessUtil.getHtmlPath(documentId)
                    if(fs.existsSync(htmlFilePath)){
                        result =  fs.readFileSync(htmlFilePath,{
                            encoding:'utf8'
                        })
                    }
                }

                return result
            },
            htmlFolder(){
                let result = ''
                if(this.documentId){
                    result = businessUtil.getIdFolderPath(this.documentId)

                }

               return result
            },
            modalWidth(){
                return this.classification||this.hasEditor?"1130":"600"
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
                                            if(_this.hasEditor){
                                                _this.documentId = _this.valueRecordCheck.documentId
                                            }

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
            tableColumnsAttachment(){
                let result = []
                if(this.hasEditor){
                    result = [
                        {
                            title:'文件名',
                            key:'fileName'
                        },
                        {
                            title:'文件大小(kb)',
                            key:'size'
                        },
                        {
                            title: '操作', key: 'action',  align: 'center',
                            width: 150,
                            render: (h, params) => {
                                const {row} = params
                                let btnAry = []
                                btnAry.push(h('Button',{
                                    props: {
                                        type:'primary',
                                        size:"small"
                                    },
                                    style: {
                                        marginRight: '5px'
                                    },
                                    on: {
                                        click: () => {
                                            let canOpen = shell.openItem(row.filePath)
                                            if(!canOpen){
                                                shell.showItemInFolder(row.filePath)
                                            }
                                        }
                                    }
                                },'查看'))
                                if(this.action !== 'check'){
                                    btnAry.push(h('Button',{
                                        props: {
                                            type:'primary',
                                            size:"small"
                                        },
                                        style: {
                                            marginRight: '5px'
                                        },
                                        on: {
                                            click: () => {
                                                fse.removeSync(row.filePath)
                                                this.refreshTableAttachment()
                                                this.$Message.success('成功删除该附件')
                                            }
                                        }
                                    },' 删除'))
                                }

                                return h('div', btnAry)
                            }
                        }
                    ]
                }
                iviewUtil.addCommonSetting(result, {sortable: true,})
                return result
            },
            totalRows() {
                return this.totalRecords.length
            },
        },
        data(){
            return {
                action:'',
                authorizationCode:'',
                classification:ormModel[this.type].classification,
                condition:{},
                currentPage:1,
                currentYear:null,
                dictService,
                documentId:"",
                hasEditor:ormModel[this.type].hasEditor,
                iviewUtil,
                loading:true,
                modalWidthInfo:660,
                modelObj:ormModel[this.type].modelObj,
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
                service:ormService[this.type],
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
                tableDataAttachment:[],
                tableTitle:ormModel[this.type].tableTitle,
                tabsValue:'',
                totalRecords:[],
                valueRecordCheck:{},
                valueRecordSave:iviewUtil.initValueRecordSave(ormModel[this.type].modelObj),
                yearParam:null
            }
        },
        destroyed(){
            if(this.htmlFolder && fs.existsSync(this.htmlFolder)){
                fs.readdir(this.htmlFolder,(err,files)=>{
                    if(err){
                        console.log(err)
                    }
                    if(files){
                        if(!files.includes('index.html')){
                            if(fs.readdirSync(this.attachmentFolderPath).length === 0){
                                fse.remove(this.htmlFolder,(err)=>{
                                    if(err){
                                        console.log(err)
                                    }
                                })
                            }

                        }
                    }
                })
            }

        },
        methods:{
            addCheckSum(){
                let ary = _.cloneDeep(this.recordsDisplayProcessed)
                return ary
            },
            changePage(index) {
                this.selectedRecordIndex = -1
                this.currentPage = index;
            },
            clickDistribute(){
                if(this.selection.length === 0){
                    this.$Message.info('请先在复选框勾选需要导出的记录')
                }else{
                    this.yearParam = this.currentYear
                    this.showExportModal = true
                }
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
            distribute(){
                dataTransport.distribute({
                    _this:this,
                    yearStr:this.yearParam.getFullYear()+'',

                })
            },
            exportData(){
                this.showExportModal = false
                this.loading = true

                let sizeOfPageOriginal = this.sizeOfPage
                let showingFieldsLocalOriginal = this.showingFieldsLocal
                this.sizeOfPage = this.totalRows
                this.showingFieldsLocal = iviewUtil.getCertainFields(this.modelObj)


                let ary = [0,1,this.tableColumns.length-1]
                let func = (ele,index)=>{
                    return !ary.includes(index)
                }
                this.$refs.table.exportCsv({
                    filename:`${iviewUtil.local(new Date())}${this.tableTitle}.csv`,
                    columns: this.tableColumns.filter(func),
                    data: this.addCheckSum(),
                    quoted:true
                })

                this.sizeOfPage = sizeOfPageOriginal
                this.showingFieldsLocal = showingFieldsLocalOriginal
                this.loading = false
                const _this = this
                setTimeout(()=>{
                    _this.$Message.info('操作成功完成')
                },1000*4)

            },
            getDatePickerOptions(field){
                return iviewUtil.getDatePickerOptions(field,this.valueRecordSave,this.modelObj)
            },
            getItemList:businessUtil.getItemList,
            getLabel:businessUtil.getLabel,
            importData(){
                dataTransport.importData({
                    _this:this,
                    authorizationCode:this.authorizationCode
                })
            },
            initTab(){
                if(this.classification){
                    this.tabsValue = Object.keys(this.classification)[0]
                }
            },
            insertImg(){
                const imageExtensions = require('image-extensions')
                dialog.showOpenDialog({
                    title:"请选择要插入的本地图片文件",
                    filters: [
                        {name: '图片文件', extensions:imageExtensions},
                    ],
                    properties:['openFile']
                },(filePaths)=>{
                    if(filePaths){
                        const filePath = filePaths[0]
                       let ary = filePath.split(path.sep)
                        let fileName = ary[ary.length-1]
                        ary = fileName.split('.')
                        const extension = ary[ary.length-1]
                         fileName = uuidV4()+'.'+extension
                        const targetPath = path.resolve(this.htmlFolder,fileName)
                        fse.copySync(filePath,targetPath)

                        const srcPath = `file://${targetPath}`
                        window.frames[0].editor.setData(window.frames[0].editor.getData()+`<img src="${srcPath}"/>`)
                        const _this = this
                        setTimeout(()=>{
                            _this.$Message.success({
                                content:'图片插入成功,请在右键快捷菜单编辑图片属性',
                                duration:8
                            })
                        },1500)

                    }
                })
            },
            openAttachmentFolder(){
                shell.showItemInFolder(businessUtil.getAttachmentFolderPath(this.htmlFolder))
            },
            openAttachmentModal(){
                this.showAttachmentModal = true
                this.refreshTableAttachment()
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
                    if(this.hasEditor){
                        window.frames[0].editor.setData('')
                        this.documentId = uuidV4()
                        fse.ensureDirSync(businessUtil.getDocumentFolderPath(this.documentId))

                    }
                    this.showSaveModal = true
                }
            },
            openSaveModalModifyInit(){
                if(this.hasEditor){
                    const htmlFilePath = path.resolve(businessUtil.getDocumentFolderPath(),`${this.valueRecordSave.documentId}/index.html`)
                    let documentData = ''
                    if(fs.existsSync(htmlFilePath)){
                        documentData = fs.readFileSync(htmlFilePath,{
                            encoding:'utf8'
                        })
                    }

                    this.documentId = this.valueRecordSave.documentId

                    window.frames[0].editor.setData(documentData)
                }

                this.showSaveModal = true
                // just workaround for armyType and its dict update
                let armyType = this.$refs.armyType

                if(armyType){
                    if(armyType instanceof Array){
                        armyType = armyType[0]
                    }
                    if(this.valueRecordSave.armyType){
                        armyType.$nextTick(()=>{
                            ormModel.armyType.modelSequelized.findOne({
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
                this.loading = true
                this.service.getAllRecords().then((records)=>{
                    this.refreshTableByData(records)
                    this.loading = false
                })
            },
            refreshTableAttachment(){
              let fileNames =  fs.readdirSync(this.attachmentFolderPath)
                let ary = []
                for(let fileName of fileNames){

                  let filePath = path.resolve(this.attachmentFolderPath,fileName)
                    let obj = {
                        fileName,filePath
                    }
                   obj.size = fs.statSync(filePath).size / 1000
                    ary.push(obj)
                }
                this.tableDataAttachment = ary
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

                    if(this.hasEditor){
                        const documentData =  window.frames[0].editor.getData()
                        let aryTmp = fs.readdirSync(this.attachmentFolderPath)
                        if(aryTmp.length === 0){
                            if(!documentData){
                                this.$Message.info({content:'请在编辑器内编辑文档',duration:3})
                                return
                            }
                        }
                        this.valueRecordSave.documentData = documentData
                    }
                    if(this.action === 'create'){
                        this.valueRecordSave.documentId = this.documentId

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
            sizeChange(val){
                this.selection = []
               this.currentPage=1
               this.sizeOfPage = (val===-1)?this.totalRows:val
            },
            test(val){
                const electron = require('electron')
                const {ipcRenderer} = electron
                // console.log(electron)
                // console.log(ipcRenderer)
                ipcRenderer.send('openPreview',{
                    show:true,
                    iframeSrc:'verified.html',
                    valueObj:{
                        name:'万红',
                        armyAlias:'2234部队',
                        joinArmyTime:'2001-3-4',
                        leaveArmyTime:'2009-8-4'
                    }
                })

            },
            uploadAttachment(){
                dialog.showOpenDialog({
                        title:"请选择上传文件",
                        properties:['openFile','multiSelections']
                    },(filePaths)=> {
                    if (filePaths) {
                        for(let filePath of filePaths){
                            let aryTem = filePath.split(path.sep)
                            let fileName = aryTem[aryTem.length-1]
                            fse.copySync(filePath,path.resolve(this.attachmentFolderPath,fileName))

                        }
                        this.refreshTableAttachment()
                        this.$Message.success('成功上传附件')

                    }
                })
            }
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
            if(this.classification||this.hasEditor){

                this.style.conditionLabel.width = '100px'
            }else{
                this.style.conditionLabel.width = '70px'
            }
            this.refreshTable()
            if(this.hasEditor){

            }
            yearService.getYearList((err,yearAry)=>{
                let yearInt = parseInt(yearAry[yearAry.length-1].value)

               this.yearParam = new Date(yearInt,0)
                this.currentYear = new Date(yearInt,0)
            })


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
                validator(type){
                    return ormModel.hasOwnProperty(type)
                }
            },
            showingFields:{
                type:Array,

            },
            excludeAry:{
                type:Array,
                default:()=>{
                    return []
                }
            }
        },
    }

    function getHash(content){
       return crypto.createHash('md5').update(other.tableCheckKey+content).digest('hex')
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
