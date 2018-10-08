const Pool = require('../store/pool');
const Log = require('./Log');
let Message = {

    _checkRemoveMsg:function (msgId) {
        let sql = `delete from message where id=? and 1>(select count(*) from flow where msgId=?)`;
        Pool.query(sql,[msgId,msgId],function (error,results,fields) {
            if(error){

            }
        });
    },

    receiveReport:function (flowId) {
        let sql = "delete from flow where id=?";
        Pool.query(sql,[flowId], (error,results,fields) =>{
            if(error){

            }else{
                this._checkRemoveMsg(flowId);
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
                select message.id as msgId,message.action,message.senderUid,message.senderDid,message.senderServerIP,message.senderServerPort,message.body,message.senderTime,message.timeout,
                flow.id as flowId,flow.targetUid,flow.targetDid,flow.targetServerIP,flow.targetServerPort,flow.random 
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
                flow.id as flowId,flow.targetServerIP,flow.targetServerPort,flow.targetText 
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
                select message.id as msgId,message.action,message.senderUid,message.senderDid,message.senderServerIP,message.senderServerPort,message.body,message.senderTime,
                flow.id as flowId,flow.targetUid,flow.targetDid,flow.targetServerIP,flow.targetServerPort,flow.random 
                from message,flow 
                where message.id = flow.msgId 
                and flow.targetUid=?
                and flow.targetDid=?
            `;
            Pool.query(sql,[uid,did], (error,results,fields) =>{
                if(error){
                    resolve(null);
                }else{
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
    asyAddMessage:function (msg) {
      console.log({asyAddMessage: msg})
        let header = msg.header;
        let sendTime = new Date();
        sendTime.setTime(header.time);
        return new Promise((resolve,reject)=>{
            let sql = `
                insert into message
                set ?
            `;
            Pool.query(sql,{
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
    asyAddLocalFlow:function (flowId,msgId,uid,did,random) {
        return new Promise((resolve,reject)=>{
            let sql = `
                insert into flow
                set ?
            `;
            Pool.query(sql,{id:flowId,msgId:msgId,targetUid:uid,targetDid:did,random:random}, (error,results,fields) =>{
                if(error){
                    reject(error);
                }else{
                    resolve();
                }
            });
        });
    },
    asyAddForeignFlow:function (flowId,msgId,targetServerIP,targetServerPort,target) {
        return new Promise((resolve,reject)=>{
            let sql = `
                insert into flow
                set ?
            `;
            Pool.query(sql,{id:flowId,msgId:msgId,targetServerIP:targetServerIP,targetServerPort:targetServerPort,targetText:JSON.stringify(target)}, (error,results,fields) =>{
                if(error){
                    reject(error);
                }else{
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
    }
}
module.exports = Message;
