const _ = require('lodash')
const fse = require('fs-extra')

const Pool = require('../store/pool');
const Log = require('./Log');
const debugLevel = require('../../constant/debugLevel')
const config = require('../../config')
const rootDir = path.resolve(__dirname,'../../')

function log (msg, level) {
  if (level <= config.debugLevel) {
    const folderName = _.findKey(debugLevel, val => {
      return val === level
    })
    const d = new Date()
    const absolutePath = path.resolve(rootDir, 'log', folderName, `${d.toLocaleDateString()}.log`)
    fse.ensureFileSync(absolutePath)
    fse.appendFileSync(absolutePath, `${d.toLocaleTimeString()}:\n    ${msg}\n\n`)
  }
}

let Message = {

    _checkRemoveMsg:function (msgId) {
        let sql = `delete from message where id=? and 1>(select count(*) from flow where msgId=?)`;
        Pool.query(sql,[msgId,msgId],function (error,results,fields) {
            if(error){
                console.error("_checkRemoveMsg:"+error.toString())
            }

        });
    },

    receiveReport:function (flowId) {
        let sql1 = "select * from flow where id=?";
        Pool.query(sql1,[flowId], (error,results,fields) =>{
            if(error){
                console.error("receiveReport:"+error.toString())
            }else if(results.length>0){
                let sql2 = "delete from flow where id=?";
                let msgId = results[0].msgId;
                Pool.query(sql2,[flowId], (error,results,fields) =>{
                    if(error){
                        console.error("receiveReport:"+error.toString())
                    }else{
                        this._checkRemoveMsg(msgId);
                    }
                });
            }
        });

    },

    // transferReceiveReport:function (msgId,targets,target) {
    //     let sql = "delete from flow where msgId=?";
    //     let params = [msgId];
    //     if(target){
    //         sql += " and targetUid=?";
    //         params.push(target.id);
    //     }else if(targets&&targets.length>0){
    //         sql += " and targetDid in(";
    //         targets.forEach((t)=>{
    //             if(t.devices&&t.devices.length>0){
    //                 t.devices.forEach((device)=>{
    //                     params.push(device.id);
    //                 });
    //             }
    //         })
    //         for(let i=1;i<params.length;i++){
    //             sql+="?";
    //             if(i<params.length-1){
    //                 sql+=",";
    //             }
    //         }
    //         sql += ")";
    //     }
    //     Pool.query(sql,params, (error,results,fields) =>{
    //         if(error){
    //
    //         }else{
    //             this._checkRemoveMsg(msgId);
    //         }
    //     });
    // },

    asyPeriodGetLocalMsgByTarget:function (targetUid,targetDid,time) {
        return new Promise((resolve,reject)=>{
            let sql = `
                select message.id as msgId,message.action,message.senderUid,message.senderDid,message.senderServerIP,message.senderServerPort,message.body,unix_timestamp(message.senderTime),message.timeout,
                flow.id as flowId,flow.targetUid,flow.targetDid,flow.preFlowId,flow.flowType,flow.targetServerIP,flow.targetServerPort,flow.random 
                from message,flow 
                where message.id = flow.msgId 
                and flow.targetUid=?
                and (flow.targetDid=? or flow.targetDid is null)
                and flow.targetServerIP is null
                and flow.lastSendTime is not null 
                and ?-unix_timestamp(flow.lastSendTime)>180000
            `;
            Pool.query(sql,[targetUid,targetDid,time], (error,results,fields) =>{
                if(error){
                    resolve(null);
                }else{
                  log(JSON.stringify(results, null, 2), debugLevel.verbose)

                  resolve(results);
                }
            });
        });

    },

    markSent:function (flowId) {
        return new Promise((resolve,reject)=>{
            let sql = " update flow set lastSendTime=? where id=? ";
            Pool.query(sql,[new Date(),flowId], (error,results,fields) =>{
                resolve();
            });
        });
    },
    asyPeriodGetForeignMsg:function (time) {
        return new Promise((resolve,reject)=>{
            let sql = `
                select message.id as msgId,message.action,message.senderUid,message.senderDid,message.body,message.senderTime,message.timeout,
                flow.id as flowId,flow.preFlowId,flow.flowType,flow.targetServerIP,flow.targetServerPort,flow.targetText 
                from message,flow 
                where message.id = flow.msgId 
                and flow.targetServerIP is not null
                and flow.lastSendTime is not null 
                and ?-unix_timestamp(flow.lastSendTime)>180000
            `;
            Pool.query(sql,[time], (error,results,fields) =>{
                if(error){
                    resolve(null);
                }else{
                    resolve(results);
                }
            });
        });
    },
    asyGetAllLocalRetainMsg:function (uid,did) {
        return new Promise((resolve,reject)=>{
            let sql = `
                select message.id as msgId,message.action,message.senderUid,message.senderDid,message.senderServerIP,message.senderServerPort,message.body,unix_timestamp(message.senderTime),
                flow.id as flowId,flow.preFlowId,flow.flowType,flow.targetUid,flow.targetDid,flow.targetServerIP,flow.targetServerPort,flow.random 
                from message,flow 
                where message.id = flow.msgId 
                and flow.targetUid=?
                and flow.targetDid=?
            `;
            Pool.query(sql,[uid,did], (error,results,fields) =>{
                if(error){
                    resolve(null);
                }else{
                  log(JSON.stringify(results, null, 2), debugLevel.verbose)
                    resolve(results);
                }
            });
        });
    },
    deleteFlows:function (did) {
        let sql = `
            delete from flow
            where targetDid=?
        `;
        Pool.query(sql,[did], (error,results,fields) =>{

        });
    },
    asyAddMessage:function (msg,parentMsgId) {
      // console.log({asyAddMessage: JSON.stringify(msg.body)})
        let header = msg.header;
        let sendTime = new Date();
        sendTime.setTime(header.time);
        return new Promise((resolve,reject)=>{
            let sql = `
                insert into message
                set ?
            `;
            Pool.query(sql,{
                parentId:parentMsgId,
                id:header.id,action:header.action,senderUid:header.uid,senderDid:header.did,body:JSON.stringify(msg.body),senderTime:sendTime,time:new Date(),timeout:header.timeout,
                senderServerIP:header.serverIP,senderServerPort:header.serverPort
            }, (error,results,fields) =>{
                if(error){
                    reject(error);
                }else{
                    resolve();
                }
            });
        });
    },
    asyAddLocalFlow:function (flowId,msgId,uid,did,random,preFlowId,flowType) {
        return new Promise((resolve,reject)=>{
            let sql = `
                insert into flow
                set ?
            `;
            Pool.query(sql,{id:flowId,msgId:msgId,targetUid:uid,targetDid:did,random:random,preFlowId:preFlowId,flowType:flowType}, (error,results,fields) =>{
                if(error){
                    reject(error);
                }else{
                    if(flowType){
                        this.setLastLocalFlowId(uid,did,flowType,flowId);
                    }
                    resolve();
                }
            });
        });
    },
    asyAddForeignFlow:function (flowId,msgId,targetServerIP,targetServerPort,target,preFlowId,flowType) {
        return new Promise((resolve,reject)=>{
            let sql = `
                insert into flow
                set ?
            `;
            Pool.query(sql,{id:flowId,msgId:msgId,targetServerIP:targetServerIP,targetServerPort:targetServerPort,targetText:JSON.stringify(target),preFlowId:preFlowId,flowType:flowType}, (error,results,fields) =>{
                if(error){
                    reject(error);
                }else{
                    if(flowType){
                        this.setLastForeignFlowId(uid,did,flowType,flowId);
                    }
                    resolve();
                }
            });
        });
    },
    asyGetMsg:function (msgId) {
        return new Promise((resolve,reject)=>{
            let sql = `
                select * 
                from message 
                where message.id = ?
            `;
            Pool.query(sql,[msgId], (error,results,fields) =>{
                if(error){
                    resolve(null);
                }else{
                    resolve(results[0]);
                }
            });
        });
    },
    _lastFlowIds:new Map(),
    asyGetLastLocalFlowId: async function (targetUid,targetDid,flowType) {
        let flowId = this._lastFlowIds.get(targetUid+targetDid+flowType);
        if(!flowId){
            flowId = await this._getLastLocalFlowId(targetUid,targetDid,flowType);
            this._lastFlowIds.set(targetUid+targetDid+flowType,flowId);
        }
        return flowId;
    },
    setLastLocalFlowId:function (targetUid,targetDid,flowType,flowId) {
        this._lastFlowIds.set(targetUid+targetDid+flowType,flowId);
    },
    _getLastLocalFlowId:function (targetUid,targetDid,flowType) {
        return new Promise((resolve,reject)=>{
            const field = 'MAX(cast(id as SIGNED INTEGER))'
            let sql = `select ${field} from flow where targetUid=? and targetDid=? and flowType=?`;
            Pool.query(sql,[targetUid,targetDid,flowType], (error,results,fields) =>{
                if(error){
                    resolve(null);
                }else{
                    resolve(results[0][field]);
                }
            });
        });
    },
    asyGetLastForeignFlowId: async function (targetServerIP,targetServerPort,flowType) {
        let flowId = this._lastFlowIds.get(targetServerIP+targetServerPort+flowType);
        if(!flowId){
            flowId = await this._getLastForeignFlowId(targetServerIP,targetServerPort,flowType);
            this._lastFlowIds.set(targetServerIP+targetServerPort+flowType,flowId);
        }
        return flowId;
    },
    setLastForeignFlowId:function (targetServerIP,targetServerPort,flowType,flowId) {
        this._lastFlowIds.set(targetServerIP+targetServerPort+flowType,flowId);
    },
    _getLastForeignFlowId:function (targetServerIP,targetServerPort,flowType) {
        return new Promise((resolve,reject)=>{
            let sql = 'select MAX(cast(id as SIGNED INTEGER)) from flow where targetServerIP=? and targetServerPort=? and flowType=?';
            Pool.query(sql,[targetServerIP,targetServerPort,flowType], (error,results,fields) =>{
                if(error){
                    resolve(null);
                }else{
                    resolve(results[0]);
                }
            });
        });
    },
    asyGetLocalFlow:function (msgId,targetUid,targetDid) {
        return new Promise((resolve,reject)=>{
            let sql = `
                select * 
                from flow 
                where flow.msgId = ?
                and targetUid = ?
                and targetDid = ?
            `;
            Pool.query(sql,[msgId,targetUid,targetDid], (error,results,fields) =>{
                if(error){
                    resolve(null);
                }else{
                    resolve(results[0]);

                }
            });
        });
    },
    asyGetForeignFlow:function (msgId,serverIP,serverPort) {
        return new Promise((resolve,reject)=>{
            let sql = `
                select * 
                from flow 
                where flow.msgId = ?
                and targetServerIP = ?
                and targetServerPort = ?
            `;
            Pool.query(sql,[msgId,serverIP,serverPort], (error,results,fields) =>{
                if(error){
                    resolve(null);
                }else{
                    resolve(results[0]);

                }
            });
        });
    },
    asyGetLocalFlowbyParentMsgId:function (parentId,targetUid,targetDid) {
        return new Promise((resolve,reject)=>{
            let sql = `
                select flow.* 
                from message,flow 
                where flow.msgId=message.id 
                and  message.parentId=? 
                and flow.targetUid = ?
                and flow.targetDid = ?
            `;
            Pool.query(sql,[parentId,targetUid,targetDid], (error,results,fields) =>{
                if(error){
                    resolve(null);
                }else{
                    resolve(results[0]);

                }
            });
        });
    },
    asyGetForeignFlowbyParentMsgId:function (parentId,serverIP,serverPort) {
        return new Promise((resolve,reject)=>{
            let sql = `
                select flow.* 
                from message,flow 
                where flow.msgId=message.id 
                and  message.parentId=? 
                and flow.targetServerIP = ?
                and flow.targetServerPort = ?
            `;
            Pool.query(sql,[parentId,serverIP,serverPort], (error,results,fields) =>{
                if(error){
                    resolve(null);
                }else{
                    resolve(results[0]);

                }
            });
        });
    },
}
module.exports = Message;
