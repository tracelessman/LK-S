var url = require('url');
var WebSocket = require('ws');
var fs = require('fs');
var path = require('path');
const Message = require('./Message');
const Log = require('./Log');

var transfer = {
    _hbTimeout: 3 * 60 * 1000,
    seed: 1,
    //临时内部id，用于标识ws
    generateWsId: function () {
        return this.seed++;
    },
    clients: new Map(),//对应多个ws uid:{_id:{_id,_uid,_did}}
    newResponseMsg: function (msgId, content) {
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
        transfer.wss = new WebSocket.Server({port: port, path: "/transfer"});
        transfer.wss.on('connection', function connection(ws, req) {
            ws.on('message', function incoming(message) {
                let msg = JSON.parse(message);
                let header = msg.header;
                let action = header.action;
                let isResponse = header.response;
                if (isResponse) {//得到接收应答，删除缓存
                    Message.receiveReport(header.msgId, header.uid, header.did);
                }
                else if (transfer[action]) {
                    if (action == "ping" || action == "login" || action == "register" || action == "authorize" || action == "errReport") {
                        transfer[action](msg, ws);
                        return;
                    } else if (ws._uid) {
                        var wsS = transfer.clients.get(ws._uid);
                        if (wsS&&wsS[ws._id]) {
                            transfer[action](msg, ws);
                            return;
                        }
                    }
                    //非法请求或需要重新登录的客户端请求
                    var date = new Date();
                    Log.info(action + " fore close,非法请求或需要重新登录的客户端请求:" + ws._name + "," + ws._uid + "," + ws._cid + "," + ws._id + "," + (date.getMonth() + 1) + "月" + date.getDate() + "日 " + date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds());
                    ws.close();
                } else {
                    var content = JSON.stringify(transfer.newResponseMsg(msg, {err: "无法识别的请求"}));
                    ws.send(content);
                }

            });

            ws.on('close', function (msg) {
                console.info("auto close:" + ws._name + "," + ws._uid + "," + ws._cid + "," + ws._id);
                if (ws._uid) {
                    var wsS = transfer.clients.get(ws._uid);
                    if (wsS&&wsS[ws._id]) {
                        delete wsS[ws._id];
                        var date = new Date();
                        Log.info("logout:" + ws._name + "," + ws._uid + "," + ws._cid + "," + ws._id + "," + (date.getMonth() + 1) + "月" + date.getDate() + "日 " + date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds());
                        let i=0;
                        for(let name in wsS){
                           if(wsS.hasOwnProperty(name)){
                               i++;
                           }
                       }
                        if (i == 0) {
                            transfer.clients.delete(ws._uid);
                        }
                    }
                }
            });
            ws.on('error', function (err) {
                console.info("ws error:" + err);
            });

        });
        transfer.wss.on('error', function (err) {
            console.info("ws server error:" + err);
        });
        setTimeout(transfer._checkTimeoutRetainMsgs, 3 * 60 * 1000);
    },
}
