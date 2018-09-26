//TODO 和其他服务器连接并发送消息
const Pool = require('../store/pool');
const WebSocket = require('ws');
const path = require('path');
const rootPath = path.resolve(__dirname,'../../')
const config = require(path.resolve(rootPath,'config'))
const  Message = require('./Message')
class WSChannel{
    constructor(url,keepAlive){
        this._reconnectDelay=0;
        this._callbacks={};
        this._timeout=60000;
        this._url = url;
        this._keepAlive = keepAlive;
    }
    applyChannel(){
        if(!this._openPromise){
            try{
                this._ws = new WebSocket(this._url);
            }catch (e){
                delete this._ws;
                return Promise.reject(e)
            }
            if(this._ws){
                this._ws.on('message',(message)=>{
                    let msg = JSON.parse(message);
                    if(msg.forEach){
                        msg.forEach((m)=> {
                            this._handleMsg(m);
                        })
                    }else{
                        this._handleMsg(msg);
                    }
                });

                this._ws.on('close',()=>{
                    if((!this._foreClosed)&&this._keepAlive){
                        this._reconnect();
                    }
                });
              this._ws.on('error',(error)=>{
               console.log(error.toString())
                console.log(this._ws.url)
              });
                this._openPromise = new Promise(resolve => {
                    this._ws.on('open',()=> {
                        resolve(this);
                    });
                })
                return this._openPromise
            }
        }else{
            return this._openPromise
        }



    }
    _handleMsg(msg){
        let header = msg.header;
        console.log({header})
        let isResponse = header.response;
        let action = header.action;
        if(isResponse){
            let msgId = header.msgId;
            let callback = this._callbacks[msgId];
            if(callback){
                console.log({callback: msg})
                callback(msg);
            }
        }
        // else if(action){
        //     let handler = this[action+"Handler"];
        //     if(handler){
        //         handler.call(this,msg);
        //     }
        // }
    }
    _reconnect(){
        let delay = this._reconnectDelay>=5000?5000:this._reconnectDelay;
        let con =  ()=> {
            this._reconnectDelay+=1000;
            delete this._openPromise;
            this.applyChannel().then(()=>{
                this._reconnectDelay=0;
            });
        }
        if(delay){
            setTimeout(()=>{
                con();
            },delay);
        }else{
            con();
        }
    }

    send(message){
        console.log({send:message, url: this._ws.url})
        this._ws.send(message);
        //TODO WebSocket is already in closing or closed state

    }
    close(){
        this._foreClosed = true;
        try{
            this._ws.close();
        }catch(e){
            console.info(e);
        }
    }
    getUrl(){
        return this._url;
    }

    sendMessage(req){
        return new Promise((resolve,reject)=>{
            let msgId = req.header.id;
            this._callbacks[msgId] = (msg)=>{
                delete this._callbacks[msgId];
                resolve(msg);
            }
            try{
                this.send(JSON.stringify(req));
            }catch (e){
                reject({error:e.toString()});
            }

            setTimeout(()=>{
                if(this._callbacks[msgId]){
                    reject({error:"timeout"});
                }

            },this._timeout);
        });

    }
}

Transfer = {
    _wss:new Map(),
    getIP:function () {
        return config.ip

    },

    getPort:function () {
        return config.wsPort

    },
    _getChannel:function (targetServerIP,targetServerPort) {
        if (!targetServerIP || !targetServerPort) {
          console.log({
            targetServerIP,targetServerPort
          })
          throw new Error(' targetServerIP || targetServerPort undefined')
        }
        let url = 'ws://'+targetServerIP+':'+targetServerPort;
        let ws = this._wss.get(url);
        if(!ws){
            ws = new WSChannel(url,true);
            this._wss.set(url,ws);
        }
        return ws;
    },

    send: async function (msg,targetServerIP,targetServerPort,server) {

        let channel = this._getChannel(targetServerIP,targetServerPort);
        channel.applyChannel().then(()=>{
            msg.header.serverIP = this.getIP();
            msg.header.serverPort = this.getPort();
            msg.header.transfer = true;
            let action = msg.header.action;
            Message.markSent(msg.header.flowId);
            channel.sendMessage(msg).then((resp)=>{
                let msgId = resp.header.id;
                let content = resp.body.content
                let diff = content?content.diff:null;
                Message.receiveReport(resp.header.flowId);
                if(diff&&action==="sendMsg"){
                    server._sendNewAction("msgDeviceDiffReport",{diff:diff,msgId:msgId,chatId:msg.body.chatId},msg.header.uid,msg.header.did);
                }

            });

        });


    }
}

module.exports = Transfer;
