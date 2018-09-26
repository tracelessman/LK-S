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
const Group = require('./Group');
const Org = require('./Org');
const UUID = require('uuid/v4');
const rootPath = path.resolve(__dirname,'../../')
const config = require(path.resolve(rootPath,'config'))
const {ormServicePromise} = require(path.resolve(rootPath,'api/store/ormService'))
const _ = require('lodash')

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
    newResponseMsg: function (msgId,content,flowId) {
        let res= {
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
        if(flowId){
            res.header.flowId = flowId;
        }
        return res;
    },
    init: function (port) {
        LKServer.wss = new WebSocket.Server({port: port});
        LKServer.wss.on('connection', function connection(ws) {
            ws.on('message', function incoming(message) {
                try{
                    let msg = JSON.parse(message);
                    const excludeAry = ['login', 'ping']
                    let header = msg.header;
                    let action = header.action;
                  if (!excludeAry.includes(action)) {
                    const msgClone = _.cloneDeep(msg)
                    const {targets} = msgClone.header

                    if (targets) {
                      console.log({targets})
                    }
                    console.log({serverMsg:msgClone})
                  }

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
                        let content = JSON.stringify(LKServer.newResponseMsg(header.msgId, {err: "无法识别的请求"}));
                        ws.send(content);
                    }

                }catch (e){
                    console.info(e);
                }

            });

            ws.on('close', function () {
                // console.info("auto close:" + ws._uid + "," + ws._did );
                if (ws._uid) {
                    let wsS = LKServer.clients.get(ws._uid);
                    if (wsS&&wsS.has(ws._did)) {
                        wsS.delete(ws._did);
                        let date = new Date();
                        // Log.info("logout:" + ws._uid + "," + ws._did + "," + (date.getMonth() + 1) + "月" + date.getDate() + "日 " + date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds());
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
            header.serverIP = row.senderServerIP;
            header.serverPort = row.senderServerPort;
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

                    let ps = [MCodeManager.asyGetOrgMagicCode(),MCodeManager.asyGetMemberMagicCode(),Org.asyGetBaseList(),Member.asyGetAll(),Friend.asyGetAllFriends(uid),Group.asyGetGroupContacts(uid),Group.asyGetAllGroupDetail(uid)];
                    let result = await Promise.all(ps);
                    const publicKey = await this.asyGetPK()
                    let content = JSON.stringify(LKServer.newResponseMsg(msg.header.id,{publicKey:publicKey,orgMCode:result[0],memberMCode:result[1],orgs:result[2],members:result[3],friends:result[4],groupContacts:result[5],groups:result[6]}));
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
        let newCurDevices = [];
        newCurDevices = newCurDevices.concat(curDevices);
        let removed = [];
        let added = [];
        for(let j=0;j<localDevices.length;j++){
            let device = localDevices[j];
            let exists = false;
            for(let i=0;i<newCurDevices.length;i++){
                let curDevice = newCurDevices[i];
                if(curDevice.id===device.id){
                    exists = true;
                    newCurDevices.splice(i,1);
                    break;
                }
            }
            if(!exists){
                removed.push(device.id);
            }
        }
        newCurDevices.forEach(function (device) {
            if(device.id!==excludeDevice){
                added.push({id:device.id,pk:device.pk});
            }
        });
        let result = {id:uid,added:added,removed:removed};
        return result;
    },

    //TODO第二次补发应该走另一个函数，此时不在返回diff

    sendMsg2:function (msg,ws) {
        this.sendMsg(msg,ws,true);
    },

    sendMsg: async function (msg,ws,nCkDiff) {
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
        console.log({
          localIp: this.getIP(),
          localPort: this.getPort()
        })
        targets.forEach((target)=>{
            if(target.serverIP&&(target.serverIP!==this.getIP()||target.serverPort!==this.getPort())){//to another server
                let targets2 = targetsNeedTrasfer.get(target.serverIP+":"+target.serverPort);
                if(!targets2){
                    targets2 = [];
                    targetsNeedTrasfer.set(target.serverIP+":"+target.serverPort,targets2);
                }
                targets2.push(target);
            }else{
                let devices = target.devices;
                if(!nCkDiff)
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
                Transfer.send(flow,ip,port,this);
            })
        })
        let content = null;
        if(!nCkDiff&&ckDiffPs.length>0){
            diffs = await Promise.all(ckDiffPs);
            content = JSON.stringify(this.newResponseMsg(msgId,{diff:diffs},header.flowId));
        }else{
            content = JSON.stringify(this.newResponseMsg(msgId,null,header.flowId));
        }
        ws.send(content);
    },

    _sendNewAction:async function(action,content,targetUid,targetDid){
        let flowId = this.generateFlowId();
        let msgId = UUID();
        let msg = {header:{
            version:"1.0",
            id:msgId,
            flowId:flowId,
            action:action
        },body:{
            content:content
        }};
        await Message.asyAddMessage(msg);
        Message.asyAddLocalFlow(flowId,msgId,targetUid,targetDid).then(()=>{
            let wsS = this.clients.get(targetUid);
            if (wsS) {
                let ws = wsS.get(targetDid);
                if(ws){
                    ws.send(JSON.stringify(msg),()=> {
                        Message.markSent(flowId);
                    });
                }
            }
        });
    },
//TODO 定时清理滞留消息 设备处于激活状态下时，如其未收到元消息，元消息始终保持在库；所以还是要有个激活状态管理，或者还是超时删除元信息，但是当再次激活时需要更新设备的元信息

    readReport:async function (msg,ws) {
        await Message.asyAddMessage(msg);
        let header = msg.header;
        let msgId = header.id;
        let srcFlowId = header.flowId;
        let target = header.target;
        if(target.serverIP&&(target.serverIP!==this.getIP()||target.serverPort!==this.getPort())) {//to another server
            let flowId = this.generateFlowId();
            Message.asyAddForeignFlow(flowId,msgId,target.serverIP,target.serverPort,target).then(()=>{
                msg.header.flowId = flowId;
                Transfer.send(msg,target.serverIP,target.serverPort,this);
            })
        }else{
            let devices = await Device.asyGetDevices(target.id);
            if(devices){
                devices.forEach((device)=>{
                    let flowId = this.generateFlowId();
                    Message.asyAddLocalFlow(flowId,msgId,target.id,device.id).then(()=>{
                        let wsS = this.clients.get(target.id);
                        if (wsS) {
                            let ws = wsS.get(device.id);
                            if(ws){
                                msg.header.flowId = flowId;
                                ws.send(JSON.stringify(msg),()=> {
                                    Message.markSent(flowId);
                                });
                            }
                        }
                    });
                });
            }
        }

        let content = JSON.stringify(this.newResponseMsg(msgId,null,srcFlowId));
        ws.send(content);
    },
    _transRemote:async function(msg,ws){
        let header = msg.header;
        let msgId = header.id;
        let target = header.target;
        await Message.asyAddMessage(msg);
        let srcFlowId = header.flowId;
        if(header.transfer){
            let devices = await Device.asyGetDevices(target.id);
            if(devices){
                devices.forEach((device)=>{
                    let flowId = this.generateFlowId();
                    Message.asyAddLocalFlow(flowId,msgId,target.id,device.id).then(()=>{
                        let wsS = this.clients.get(target.id);
                        if (wsS) {
                            let ws = wsS.get(device.id);
                            if(ws){
                                header.flowId = flowId;
                                ws.send(JSON.stringify(msg),()=> {
                                    Message.markSent(flowId);
                                });
                            }
                        }
                    });
                });
            }
        }else{
            let newFlowId = this.generateFlowId();
            Message.asyAddForeignFlow(newFlowId,msgId,target.serverIP,target.serverPort,target).then(()=>{
                header.flowId = newFlowId;
                Transfer.send(msg,target.serverIP,target.serverPort);
            });

        }
        let content = JSON.stringify(this.newResponseMsg(msgId,null,srcFlowId));
        ws.send(content);
    },
    applyMF:function(msg,ws){
        this._transRemote(msg,ws);
    },
    acceptMF:async function(msg,ws){
        let header = msg.header;
        let content = msg.body.content;

        this._transRemote(msg,ws).then(()=>{
            if(header.transfer){
                Member.asyGetContact(header.uid).then((contact)=>{
                    if(!contact){
                        Member.asyAddContact(header.uid,content.accepter.name,content.accepter.pic,header.serverIP,header.serverPort);
                    }
                })
                Friend.asyGetFriend(header.target.id,header.uid).then((friend)=>{
                    if(!friend){
                        Friend.asyAddFriend(header.target.id,header.uid);
                    }
                });
            }else{
                Device.asyGetDevices(header.uid).then((devices)=>{
                    if(devices){
                        devices.forEach((device)=>{
                            if(device.id!==header.did){
                                let flowId = this.generateFlowId();
                                Message.asyAddLocalFlow(flowId,header.msgId,header.uid,device.id).then(()=>{
                                    let wsS = this.clients.get(header.uid);
                                    if (wsS) {
                                        let ws = wsS.get(device.id);
                                        if(ws){
                                            header.flowId = flowId;
                                            ws.send(JSON.stringify(msg),()=> {
                                                Message.markSent(flowId);
                                            });
                                        }
                                    }
                                });
                            }

                        });
                    }
                });

                Member.asyGetContact(header.target.id).then((contact)=>{
                    if(!contact){
                        Member.asyAddContact(header.target.id,content.applyer.name,content.applyer.pic,header.target.serverIP,header.target.serverPort);
                    }
                })
                Friend.asyGetFriend(header.uid,header.target.id).then((friend)=>{
                    if(!friend){
                         Friend.asyAddFriend(header.uid,header.target.id);
                    }
                });
            }
        });
    },
    addGroupChat:async function (msg,ws) {
        let header = msg.header;
        let msgId = header.id;
        let curMsg = await Message.asyGetMsg(msgId);
        if(!curMsg){
            await Message.asyAddMessage(msg);
        }
        let members = msg.body.content.members;

        let chatId = msg.body.content.chatId;
        Group.asyGetGroup(chatId).then((group)=>{
            if(!group){
                Group.asyAddGroup(chatId,msg.body.content.name);
                members.forEach((member)=>{
                    Member.asyGetContact(member.id).then((contact)=>{
                        if(!contact){
                            Member.asyAddContact(member.id,member.name,member.pic,member.serverIP,member.serverPort);
                        }
                    })
                    Group.asyAddGroupMember(chatId,member.id);
                });
                if(header.transfer){
                    let targets = header.targets;
                    targets.forEach((target)=>{
                        Device.asyGetDevices(target.id).then((devices)=>{
                            if(devices){
                                devices.forEach((device)=>{
                                    let flowId = this.generateFlowId();
                                    Message.asyAddLocalFlow(flowId,msgId,target.id,device.id).then(()=>{
                                        let wsS = this.clients.get(target.id);
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
                        });
                    });
                }else{
                    let targetsNeedTrasfer = new Map();
                    members.forEach((target)=>{
                        if(target.serverIP&&(target.serverIP!==this.getIP()||target.serverPort!==this.getPort())){//to another server
                            let targets2 = targetsNeedTrasfer.get(target.serverIP+":"+target.serverPort);
                            if(!targets2){
                                targets2 = [];
                                targetsNeedTrasfer.set(target.serverIP+":"+target.serverPort,targets2);
                            }
                            targets2.push(target);
                        }else{
                            Device.asyGetDevices(target.id).then((devices)=>{
                                if(devices){
                                    devices.forEach((device)=>{
                                        if(device.id!==header.did){
                                            let flowId = this.generateFlowId();
                                            Message.asyAddLocalFlow(flowId,msgId,target.id,device.id).then(()=>{
                                                let wsS = this.clients.get(target.id);
                                                if (wsS) {
                                                    let ws = wsS.get(device.id);
                                                    if(ws){
                                                        ws.send(JSON.stringify(msg),()=> {
                                                            Message.markSent(flowId);
                                                        });
                                                    }
                                                }
                                            });
                                        }
                                    });
                                }
                            });

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
                            Transfer.send(flow,ip,port,this);
                        })
                    })

                }
            }
        });
        let content = JSON.stringify(this.newResponseMsg(msgId,null,header.flowId));
        ws.send(content);
    },
    setUserName: async function (msg,ws) {
        let uid = msg.header.uid;
        let msgId = msg.header.id;
        await Member.setUserName(uid,msg.body.content.name);
        let content = JSON.stringify(this.newResponseMsg(msgId));
        ws.send(content);
    },
    setUserPic: async function (msg,ws) {
        let uid = msg.header.uid;
        let msgId = msg.header.id;
        await Member.setUserPic(uid,msg.body.content.pic);
        let content = JSON.stringify(this.newResponseMsg(msgId));
        ws.send(content);
    }
}

LKServer.init(config.wsPort)

module.exports = LKServer
