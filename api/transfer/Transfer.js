
//TODO 和其他服务器连接并发送消息

Transfer = {
    _wss:new Map(),
    asyTrans:function (msg) {
        let key = msg.targetServerIP+msg.targetServerPort;
        if(this._wss.has(key)){
            this._wss.has(key)
        }
    }
}