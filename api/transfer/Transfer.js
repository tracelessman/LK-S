//TODO 和其他服务器连接并发送消息

const WebSocket = require('ws');

class WSChannel{

    _reconnectDelay=0

    constructor(url,keepAlive){
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
                this._ws.on('message',()=>{

                });

                this._ws.on('close',()=>{
                    if((!this._foreClosed)&&this._keepAlive){
                        this._reconnect();
                    }
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
}

Transfer = {
    _wss:new Map(),
    send:function (msg,serverIP,serverPort,targetServerIP,targetServerPort) {
        let url = 'ws://'+targetServerIP+':'+targetServerPort;
        let ws = this._wss.get(url);
        if(!ws){
            ws = new WSChannel(url,true);
            this._wss.set(url,ws);
        }
        ws.applyChannel().then(()=>{
            ws.send(JSON.stringify(msg));
        });


    }
}

module.exports = Transfer;