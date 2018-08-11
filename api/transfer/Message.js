const Pool = require('../Store/pool');
const Log = require('./Log');
let Message = {
    
    _checkRemoveMsg:function (msgId) {
        let sql =`
            select * from flow where msgId=?
        `;
        Pool.query(sql,[msgId],function (error,results,fields) {
            if(error){

            }else{
                if(results.length==0){
                    let sql = `delete from message where id=?`;
                    Pool.query(sql,[msgId],function (error,results,fields) {
                        if(error){

                        }
                    });
                }
            }
        });
    },

    receiveReport:function (msgId,uid,did) {
        let sql = `
            delete from flow
            where msgId=? and targetDid=?
        `;
        Pool.query(sql,[msgId,did], (error,results,fields) =>{
            if(error){
                
            }else{
                this._checkRemoveMsg(msgId);
            }
        });
    },

    asyPeriodGetLocalMsgByTarget:function (targetUid,targetDid,time) {
        return new Promise((resolve,reject)=>{
            let sql = `
                select message.id as msgId,message.action,message.senderUid,message.senderDid,message.senderServerIP,message.senderServerPort,message.body,message.senderTime,
                flow.targetUid,flow.targetDid,flow.targetServerIP,flow.targetServerPort,flow.random 
                from message,flow 
                where message.id = flow.msgId 
                and flow.targetUid=?
                and flow.targetDid=?
                and flow.targetServerIP is null
                and flow.lastSendTime is not null 
                and ?-flow.lstSendTime>180000
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

    markSent:function (msgId,targetUid,targetDid) {
        return new Promise((resolve,reject)=>{
            let sql = `
                update flow set lastSendTime=?
                where msgId=? and targetUid=? and targetDid=?
            `;
            Pool.query(sql,[Date.now(),msgId,targetUid,targetDid], (error,results,fields) =>{
                resolve();
            });
        });
    },
    asyPeriodGetForeignMsg:function (time) {
        return new Promise((resolve,reject)=>{
            let sql = `
                select message.id as msgId,message.action,message.senderUid,message.senderDid,message.senderServerIP,message.senderServerPort,message.body,message.senderTime,
                flow.targetUid,flow.targetDid,flow.targetServerIP,flow.targetServerPort,flow.random 
                from message,flow 
                where message.id = flow.msgId 
                and flow.targetServerIP is not null
                and flow.lastSendTime is not null 
                and ?-flow.lstSendTime>180000
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
    asyGetAllRetainMsg:function (uid,did) {
        return new Promise((resolve,reject)=>{
            let sql = `
                select message.id as msgId,message.action,message.senderUid,message.senderDid,message.senderServerIP,message.senderServerPort,message.body,message.senderTime,
                flow.targetUid,flow.targetDid,flow.targetServerIP,flow.targetServerPort,flow.random 
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
        let header = msg.header;
        let sendTime = new Date()
        sendTime.setTime(header.time);
        return new Promise((resolve,reject)=>{
            let sql = `
                insert into message
                set ?
            `;
            Pool.query(sql,{id:header.id,action:header.action,senderUid:header.uid,senderDid:header.did,body:msg.body,senderTime:sendTime,time:new Date(),timeout:header.timeout}, (error,results,fields) =>{
                if(error){
                    reject(error);
                }else{
                    resolve();
                }
            });
        });
    },
    asyAddFlow:function (msgId,uid,did,random) {
        let header = msg.header;
        let sendTime = new Date()
        sendTime.setTime(header.time);
        return new Promise((resolve,reject)=>{
            let sql = `
                insert into flow
                set ?
            `;
            Pool.query(sql,{msgId:msgId,targetUid:uid,targetDid:did,random:random}, (error,results,fields) =>{
                if(error){
                    reject(error);
                }else{
                    resolve();
                }
            });
        });
    }
}
module.exports = Message;
