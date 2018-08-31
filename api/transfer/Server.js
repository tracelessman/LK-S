const WebSocket = require('ws');
const path = require('path');
const Message = require('./Message');
const Log = require('./Log');
const Transfer = require('./Transfer');
const MCodeManager = require('./MCodeManager');
const DeviceManager = require('./DeviceManager');
const Member = require('./Member');
const Device = require('./Device');
const Friend = require('./Friend');
const Org = require('./Org');
const rootPath = path.resolve(__dirname,'../../')
const config = require(path.resolve(rootPath,'config'))
const {ormServicePromise} = require(path.resolve(rootPath,'api/store/ormService'))

let LKServer = {
    _hbTimeout: 3 * 60 * 1000,
    _flowSeqSeed:Date.now(),
    _wsIdSeed: 1,
    //临时内部id，用于标识ws
    generateWsId: function () {
        return this._wsIdSeed++;
    },
    generateFlowId:function () {
      return "f"+(this._flowSeqSeed++);
    },
    clients: new Map(),//对应多个ws uid:{_did:ws}
    newResponseMsg: function (flowId,msgId,content) {
        return {
            header:{
                version:"1.0",
                flowId:flowId,
                msgId:msgId,
                response:true,
                // orgMCode:"",
                // mCode:""
            },
            body:{
                content:content
            }
        };
    },
    init: function (port) {
        LKServer.wss = new WebSocket.Server({port: port});
        LKServer.wss.on('connection', function connection(ws) {
            ws.on('message', function incoming(message) {
                try{
                    let msg = JSON.parse(message);
                    let header = msg.header;
                    let action = header.action;
                    let isResponse = header.response;
                    if (isResponse) {//得到接收应答，删除缓存
                        Message.receiveReport(header.flowId);
                    }
                    else if (LKServer[action]) {
                        LKServer[action](msg, ws);
                        // if (action == "ping" || action == "login" || action == "register" || action == "authorize" || action == "errReport") {
                        //     LKServer[action](msg, ws);
                        //     return;
                        // } else if (ws._uid) {
                        //     var wsS = LKServer.clients.get(ws._uid);
                        //     if (wsS&&wsS.has(ws._did)) {
                        //         LKServer[action](msg, ws);
                        //         return;
                        //     }
                        // }
                        // //非法请求或需要重新登录的客户端请求
                        // let date = new Date();
                        // Log.info(action + " fore close,非法请求或需要重新登录的客户端请求:" + ws._uid + "," + ws._did + "," + (date.getMonth() + 1) + "月" + date.getDate() + "日 " + date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds());
                        // ws.close();
                    } else {
                        let content = JSON.stringify(LKServer.newResponseMsg(header.flowId, {err: "无法识别的请求"}));
                        ws.send(content);
                    }

                }catch (e){
                    console.info(e);
                }

            });

            ws.on('close', function () {
                console.info("auto close:" + ws._uid + "," + ws._did );
                if (ws._uid) {
                    let wsS = LKServer.clients.get(ws._uid);
                    if (wsS&&wsS.has(ws._did)) {
                        wsS.delete(ws._did);
                        let date = new Date();
                        Log.info("logout:" + ws._uid + "," + ws._did + "," + (date.getMonth() + 1) + "月" + date.getDate() + "日 " + date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds());
                        if (wsS.size===0) {
                            LKServer.clients.delete(ws._uid);
                        }
                    }
                }
            });
            ws.on('error', function (err) {
                console.info("ws error:" + err);
            });

        });
        LKServer.wss.on('error', function (err) {
            console.info("ws server error:" + err);
        });
        setTimeout(()=>{this._asyCheckTimeoutRetainMsgs()}, 3 * 60 * 1000);
    },
    getIP:function () {
        return config.ip

    },

    getPort:function () {
        return config.wsPort

    },
    async asyGetPK(encoding = 'base64') {
       const ormService =  await ormServicePromise
        const record = await ormService.user.getFirstRecord()
        return record.publicKey.toString(encoding)
    },
    _newMsgFromRow:function (row,local) {
        let msg = {
            header:{target:{}}
        };
        let header = msg.header;
        header.version = "1.0";
        header.id = row.msgId;
        header.flowId = row.flowId;
        header.action = row.action;
        header.uid = row.senderUid;
        header.did = row.senderDid;
        header.time = row.sendTime;
        header.timeout = row.timeout;
        if(local){
            header.target.id = row.targetUid;
            header.target.did = row.targetDid;
            header.target.random = row.random;
        }else{
            let target = JSON.parse(row.targetText);
            if(target.forEach){
                header.targets = target;
            }else{
                header.target = target;
            }
        }
        msg.body = JSON.parse(row.body);
        return msg;
    },
    _sendLocalRetainMsgs:function (ws,rows) {
        if(rows&&rows.length>0){
            let msgs = [];
            for(let i=0;i<rows.length;i++){
                let row = rows[i];
                msgs.push(this._newMsgFromRow(row,true));
            }
            ws.send(JSON.stringify(msgs),function () {
                msgs.forEach(function (msg) {
                    Message.markSent(msg.header.flowId);
                })
            });
        }

    },
    _checkSingalWSTimeoutMsgs:function (ws,time) {
        return new Promise((resolve)=>{
            if(time-ws._lastHbTime>this._hbTimeout){
                ws.close();
                resolve();
            }else{
                Message.asyPeriodGetLocalMsgByTarget(ws._uid,ws._did,time).then((results)=>{
                    this._sendLocalRetainMsgs(ws,results);
                    resolve();
                })
            }
        });

    },
     _asyCheckTimeoutRetainMsgs:async function () {
        //local members's retain msg
        let time = Date.now();
         let ps = [Message.asyPeriodGetForeignMsg(time)];
         this.clients.forEach( (wsS)=>{
            wsS.forEach((ws)=>{
                ps.push(this._checkSingalWSTimeoutMsgs(ws,time))
            })
        })
        let results = await Promise.all(ps);
        //foreign contact's retain msg
        let foreignMsgs = results[0];
        if(foreignMsgs){
            foreignMsgs.forEach( (row) =>{
                let msg = this._newMsgFromRow(row,false);
                Transfer.send(msg,row.serverIP,row.serverPort);
            })
        }
        setTimeout(()=>{this._asyCheckTimeoutRetainMsgs()}, 3 * 60 * 1000);
    },
    ping: async function(msg,ws){
        ws._lastHbTime = Date.now();
        let result = await Promise.all([MCodeManager.asyGetOrgMagicCode(),MCodeManager.asyGetMemberMagicCode]);
        let orgMCode = result[0];
        let memberMCode = result[1];
        let ps = [];
        if(msg.header.orgMCode!==orgMCode){
            ps.push(Org.asyGetBaseList());
        }
        if(msg.header.memberMCode!==memberMCode){
            ps.push(Member.asyGetAllMCodes())
        }
        result = await Promise.all(ps)
        let content = JSON.stringify(
            LKServer.newResponseMsg(msg.header.id,
                {
                    orgMCode:orgMCode,
                    memberMCode:memberMCode,
                    orgs:msg.header.orgMCode!==orgMCode?result[0]:null,
                    members:msg.header.memberMCode!==memberMCode?result[1]:null
                }

        ));
        ws.send(content);
    },
    fetchMembers:function (msg,ws) {
        let ids = msg.content.members;
        Member.asyGetMembers(ids).then(function (members) {
            let content = JSON.stringify(LKServer.newResponseMsg(msg.header.id,{members:members}));
            ws.send(content);
        });
    },
    login:function (msg,ws) {
        let uid = msg.header.uid;
        let did = msg.header.did;
        // Member.asyGetMember(uid).then((member)=>{
        //     if(member){
                let wsS = this.clients.get(uid);
                if (!wsS) {
                    wsS = new Map();
                    this.clients.set(uid,wsS);
                }
                if(wsS.has(ws._did)){
                    let old = wsS.get(ws._did);
                    wsS.delete(ws._did);
                    if(old!==ws){
                        old.close();
                    }
                }
                ws._uid = uid;
                ws._did = did;
                ws._lastHbTime = Date.now();
                wsS.set(did,ws);

                let content = JSON.stringify(LKServer.newResponseMsg(msg.header.id));
                ws.send(content);
                Message.asyGetAllLocalRetainMsg(uid,did).then((rows)=>{
                    this._sendLocalRetainMsgs(ws,rows);
                });
            // }else{
            //     let content = JSON.stringify(LKServer.newResponseMsg(msg.header.id,{error:"not exist"}));
            //     ws.send(content);
            // }
        // });
    },
    register:async function (msg,ws) {

        let content = msg.body.content;
        let uid = content.uid;
        let did = content.did;
        let venderDid = content.venderDid;
        let pk = content.pk;
        // let checkCode = content.checkCode;
        // let qrCode = content.qrCode;
        let description = content.description;
        //TODO 验证签名,checkCode,修改ticket,memeber记录
        //验证是否存在该人员
        let member = await Member.asyGetMember(uid);
        if(member){
            //设备id是否重复
            let device = await Device.asyGetDevice(did);
            if(device){
                let content = JSON.stringify(LKServer.newResponseMsg(msg.header.id,{error:"device id already exist"}));
                ws.send(content);
            }else{
                try{
                    await Device.asyAddDevice(uid,did,venderDid,pk,description);
                    DeviceManager.deviceChanged(uid);
                    //返回全部org、members、该人的好友

                    let ps = [MCodeManager.asyGetOrgMagicCode(),MCodeManager.asyGetMemberMagicCode(),Org.asyGetBaseList(),Member.asyGetAll(),Friend.asyGetAllFriends()];
                    let result = await Promise.all(ps);
                    const publicKey = await this.asyGetPK()
                    let content = JSON.stringify(LKServer.newResponseMsg(msg.header.id,{publicKey,orgMCode:result[0],memberMCode:result[1],orgs:result[2],members:result[3],friends:result[4]}));
                    ws.send(content);
                }catch(error){
                    console.log(error)

                    let content = JSON.stringify(LKServer.newResponseMsg(msg.header.id,{error:error.toString()}));
                    ws.send(content);
                }

            }
        }else{
            let content = JSON.stringify(LKServer.newResponseMsg(msg.header.id,{error:"member not exist"}));
            ws.send(content);
        }

        //注册设备
    },
    unRegister: function (msg,ws) {
        let header = msg.header;
        let uid = header.uid;
        let did = header.did;
        Device.asyRemoveDevice(uid,did).then(function () {
            DeviceManager.deviceChanged(uid);
            let content = JSON.stringify(LKServer.newResponseMsg(msg.header.id));
            ws.send(content);
            Message.deleteFlows(did);
        });
    },
    _checkDeviceDiff:async function (uid,localDevices,excludeDevice) {
        let curDevices = await DeviceManager.asyGetDevices(uid);
        let removed = [];
        let added = [];
        for(let j=0;j<localDevices.length;j++){
            let device = localDevices[j];
            let exists = false;
            for(let i=0;i<curDevices.length;i++){
                let curDevice = curDevices[i];
                if(curDevice.id===device.id){
                    exists = true;
                    curDevices.splice(i,1);
                    break;
                }
            }
            if(!exists){
                removed.push(device.id);
            }
        }
        curDevices.forEach(function (device) {
            if(device.id!==excludeDevice){
                added.push({id:device.id,pk:device.pk});
            }
        });
        return {id:uid,added:added,removed:removed};
    },

    //TODO第二次补发应该走另一个函数，此时不在返回diff

    sendMsg: async function (msg,ws) {
        let header = msg.header;
        let msgId = header.id;
        let curMsg = await Message.asyGetMsg(msgId);
        if(!curMsg){
            await Message.asyAddMessage(msg);
        }
        let targets = header.targets;
        let senderDid = header.did;
        let diffs = [];
        let ckDiffPs = [];

        let targetsNeedTrasfer = new Map();
        targets.forEach((target)=>{
            let devices = target.devices;
            if(target.serverIP&&(target.serverIP!==this.getIP()||target.serverPort!==this.getPort())){//to another server
                let targets2 = targetsNeedTrasfer.get(target.serverIP+":"+target.serverPort);
                if(!targets2){
                    targets2 = [];
                    targetsNeedTrasfer.set(target.serverIP+":"+target.serverPort,targets2);
                }
                targets2.push(target);
            }else{
                ckDiffPs.push(this._checkDeviceDiff(target.id,devices,senderDid));
                devices.forEach((device)=>{
                    let flowId = this.generateFlowId();
                    Message.asyAddLocalFlow(flowId,msgId,target.id,device.id,device.random).then(()=>{
                        let wsS = this.clients.get(target.id);
                        if (wsS) {
                            let ws = wsS.get(device.id);
                            if(ws){
                                let flowMsg = {header:{
                                    version:header.version,
                                    id:header.id,
                                    flowId:flowId,
                                    uid:header.uid,
                                    did:header.did,
                                    action:header.action,
                                    time:header.time,
                                    timeout:header.timeout,
                                    target:{
                                        id:target.id,
                                        did:device.id,
                                        random:device.random,
                                    }
                                },body:msg.body};
                                ws.send(JSON.stringify(flowMsg),()=> {
                                    Message.markSent(flowId);
                                });
                            }
                        }
                    });
                })
            }
        });
        targetsNeedTrasfer.forEach((v,k)=>{
            let key = k.split(":");
            let ip = key[0];
            let port = key[1];
            let flowId = this.generateFlowId();
            Message.asyAddForeignFlow(flowId,msgId,ip,port,v).then(()=>{
                let flow = {header:{
                    version:header.version,
                    id:msgId,
                    flowId:flowId,
                    uid:header.uid,
                    did:header.did,
                    action:header.action,
                    time:header.time,
                    timeout:header.timeout,
                    targets : v
                },body:msg.body};
                Transfer.send(flow,ip,port);
            })
        })

        if(ckDiffPs.length>0){
            diffs = await Promise.all(ckDiffPs);
        }
        let content = JSON.stringify(this.newResponseMsg(msgId,{diff:diffs}));
        ws.send(content);
    },

//TODO 定时清理滞留消息

    readReport:async function (msg,ws) {
        await Message.asyAddMessage(msg);
        let header = msg.header;
        let msgId = header.id;
        let target = header.target;
        let devices = await Device.asyGetDevices(target);
        if(devices){
            devices.forEach((device)=>{
                let flowId = this.generateFlowId();
                Message.asyAddLocalFlow(flowId,msgId,target,device.id).then(()=>{
                    let wsS = this.clients.get(target);
                    if (wsS) {
                        let ws = wsS.get(device.id);
                        if(ws){
                            ws.send(JSON.stringify(msg),()=> {
                                Message.markSent(flowId);
                            });
                        }
                    }
                });
            });
        }
        let content = JSON.stringify(this.newResponseMsg(msgId));
        ws.send(content);
    },
    applyMF:async function(msg,ws){
        let header = msg.header;
        let msgId = header.id;
        let target = header.target;
        if(header.transfer){
            await Message.asyAddMessage(msg);
            let flowId = this.generateFlowId();
            Message.asyAddLocalFlow(flowId,msgId,target.id).then(()=>{
                let wsS = this.clients.get(target.id);
                if (wsS&&wsS.size>0) {
                    let msgStr = JSON.stringify(msg);
                    let marked =false;
                    wsS.forEach((v)=>{
                        v.send(msgStr,()=> {
                            if(!marked){
                                marked = true;
                                Message.markSent(flowId);
                            }
                        });
                    })
                }
            });
            let content = JSON.stringify(this.newResponseMsg(msgId,target));
            ws.send(content);
        }else{
            if(target.serverIP!==this.getIP()||target.serverPort!==this.getPort()){
                await Message.asyAddMessage(msg);
                let flowId = this.generateFlowId();
                Message.asyAddForeignFlow(flowId,msgId,target.serverIP,target.serverPort,target).then(()=>{
                    msg.header.flowId = flowId;
                    Transfer.send(msg,target.serverIP,target.serverPort);
                });
                let content = JSON.stringify(this.newResponseMsg(msgId));
                ws.send(content);
            }else{
                let content = JSON.stringify(this.newResponseMsg(msgId,{error:"target in the same org"}));
                ws.send(content);
            }
        }

    }
}

module.exports = LKServer
