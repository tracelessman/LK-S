var url = require('url');
var WebSocket = require('ws');
var fs = require('fs');
var path = require('path');
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

var LKServer = {
    _hbTimeout: 3 * 60 * 1000,
    seed: 1,
    //临时内部id，用于标识ws
    generateWsId: function () {
        return this.seed++;
    },
    clients: new Map(),//对应多个ws uid:{_did:ws}
    newResponseMsg: function (msgId,content) {
        return {
            header:{
                version:"1.0",
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
        LKServer.wss.on('connection', function connection(ws, req) {
            ws.on('message', function incoming(message) {

                let msg = JSON.parse(message);
                let header = msg.header;
                let action = header.action;
                let isResponse = header.response;
                if (isResponse) {//得到接收应答，删除缓存
                    Message.receiveReport(header.msgId, header.uid, header.did);
                }
                else if (LKServer[action]) {
                    if (action == "ping" || action == "login" || action == "register" || action == "authorize" || action == "errReport") {
                        LKServer[action](msg, ws);
                        return;
                    } else if (ws._uid) {
                        var wsS = LKServer.clients.get(ws._uid);
                        if (wsS&&wsS.has(ws._did)) {
                            LKServer[action](msg, ws);
                            return;
                        }
                    }
                    //非法请求或需要重新登录的客户端请求
                    let date = new Date();
                    Log.info(action + " fore close,非法请求或需要重新登录的客户端请求:" + ws._uid + "," + ws._did + "," + (date.getMonth() + 1) + "月" + date.getDate() + "日 " + date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds());
                    ws.close();
                } else {
                    var content = JSON.stringify(LKServer.newResponseMsg(msg, {err: "无法识别的请求"}));
                    ws.send(content);
                }

            });

            ws.on('close', function (msg) {
                console.info("auto close:" + ws._uid + "," + ws._did );
                if (ws._uid) {
                    var wsS = LKServer.clients.get(ws._uid);
                    if (wsS&&wsS.has(ws._did)) {
                        wsS.delete(ws._did);
                        let date = new Date();
                        Log.info("logout:" + ws._uid + "," + ws._did + "," + (date.getMonth() + 1) + "月" + date.getDate() + "日 " + date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds());
                        if (wsS.size==0) {
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
    _newMsgFromRow:function (row) {
        let msg = {
            header:{target:{}}
        };
        let header = msg.header;
        header.version = "1.0";
        header.id = row.msgId;
        header.action = row.action;
        header.uid = row.senderUid;
        header.did = row.senderDid;
        header.time = row.sendTime;
        header.timeout = row.timeout,

        header.target.id = row.targetUid;
        header.target.did = row.targetDid;
        header.target.random = row.random;
        msg.body = JSON.parse(row.body);
        return msg;
    },
    _sendLocalRetainMsgs:function (ws,rows) {
        if(rows&&rows.length>0){
            let msgs = [];
            for(let i=0;i<rows.length;i++){
                let row = rows[i];
                msgs.push(this._newMsgFromRow(row));
            }
            ws.send(JSON.stringify(msgs),function () {
                msgs.forEach(function (msg) {
                    Message.markSent(msg.header.id,ws._uid,ws._did);
                })
            });
        }

    },
    _checkSingalWSTimeoutMsgs:function (ws,time) {
        return new Promise((resolve,reject)=>{
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
         this.clients.forEach( (wsS,uid)=>{
            wsS.forEach((ws,id)=>{
                ps.push(this._checkSingalWSTimeoutMsgs(ws,time))
            })
        })
        let results = await Promise.all(ps);
        //foreign contact's retain msg
        let foreignMsgs = results[0];
        let ps2 = [];
        if(foreignMsgs){
            foreignMsgs.forEach(function (msg) {
                ps2.push(Transfer.asyTrans(msg));
            })
        }
        await Promise.all(ps2);
        setTimeout(()=>{this._asyCheckTimeoutRetainMsgs()}, 3 * 60 * 1000);
    },
    ping: async function(msg,ws){
        ws._lastHbTime = Date.now();
        let result = await Promise.all([MCodeManager.asyGetOrgMagicCode(),MCodeManager.asyGetMemberMagicCode]);
        let orgMCode = result[0];
        let memberMCode = result[1];
        let ps = [];
        if(msg.header.orgMCode!=orgMCode){
            ps.push(Org.asyGetBaseList());
        }
        if(msg.header.memberMCode!=memberMCode){
            ps.push(Member.asyGetAllMCodes())
        }
        result = await Promise.all(ps)
        let content = JSON.stringify(
            LKServer.newResponseMsg(msg.header.id,
                {
                    orgMCode:orgMCode,
                    memberMCode:memberMCode,
                    orgs:msg.header.orgMCode!=orgMCode?result[0]:null,
                    members:msg.header.memberMCode!=memberMCode?result[1]:null
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
                var wsS = this.clients.get(uid);
                if (!wsS) {
                    wsS = new Map();
                    this.clients.set(uid,wsS);
                }
                if(wsS.has(ws._did)){
                    let old = wsS.get(ws._did);
                    wsS.delete(ws._did);
                    if(old!=ws){
                        old.close();
                    }
                }
                ws._uid = uid;
                ws._did = did;
                ws._lastHbTime = Date.now();
                wsS.set(did,ws);

                let content = JSON.stringify(LKServer.newResponseMsg(msg.header.id));
                ws.send(content);
                Message.asyGetAllRetainMsg(uid,did).then((rows)=>{
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
        let checkCode = content.checkCode;
        let qrCode = content.qrCode;
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
            if(device.id!==excludeDevice)
                added.push({id:device.id,pk:device.pk});
        });
        return {id:uid,added:added,removed:removed};
    },
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
        targets.forEach((target)=>{
            let devices = target.devices;
            ckDiffPs.push(this._checkDeviceDiff(target.id,devices,senderDid));
            devices.forEach((device)=>{
                //if(diff.removed.indexOf(device.id)!=-1){
                    Message.asyAddFlow(msgId,target.id,device.id,device.random).then(()=>{
                        var wsS = this.clients.get(target.id);
                        if (!wsS) {
                            let ws = wsS.get(device.id);
                            if(ws){
                                let flowMsg = {header:{
                                    version:header.version,
                                    id:header.id,
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
                                    Message.markSent(header.id,target.id,device.id);
                                });
                            }
                        }
                    });
                //}
            })

        });
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
        let devices = target.devices;
        devices.forEach((device)=>{
            Message.asyAddFlow(msgId,target.id,device.id).then(()=>{
                var wsS = this.clients.get(target.id);
                if (!wsS) {
                    let ws = wsS.get(device.id);
                    if(ws){
                        let flowMsg = {header:{
                            version:header.version,
                            id:header.id,
                            uid:header.uid,
                            did:header.did,
                            action:header.action,
                            time:header.time,
                            timeout:header.timeout,
                            target:{
                                id:target.id,
                                did:device.id
                            }
                        },body:msg.body};
                        ws.send(JSON.stringify(flowMsg),()=> {
                            Message.markSent(header.id,target.id,device.id);
                        });
                    }
                }
            });
        });

    }
}

module.exports = LKServer
