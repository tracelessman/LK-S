const Pool = require('../store/pool');
const Log = require('./Log');
let TransferFlowCursor = {
    _flows:new Map(),
    getLastFlowId:function(serverIP,serverPort,flowType){
        return new Promise((resolve,reject)=>{
            let flowId = this._flows.get(serverIP+serverPort+flowType);
            if(!flowId){
                let sql = "select flowId from transferFlowCursor where serverIP=? and serverPort=? and flowType=?";
                Pool.query(sql,[serverIP,serverPort,flowType], (error,results,fields) =>{
                    if(error){
                        resolve(null);
                    }else if(results.length==0){
                        resolve(null);
                    }else{
                        flowId = results[0].flowId;
                        this._flows.set(serverIP+serverPort+flowType,flowId)
                        resolve(flowId);
                    }
                });

            }else{
                resolve(flowId);
            }

        });
    },

    setLastFlowId:function(serverIP,serverPort,flowType,flowId){
        return new Promise((resolve,reject)=>{
            this.getLastFlowId(serverIP,serverPort,flowType).then((flowId)=>{
                let sql;
                if(!flowId){
                    sql = "insert into transferFlowCursor(flowId,serverIP,serverPort,flowType) values (?,?,?,?)";
                }else{
                    sql = "update transferFlowCursor set flowId=? where serverIP=? and serverPort=? and flowType=?";
                }
                db.transaction((tx)=>{
                    tx.executeSql(sql,[flowId,serverIP,serverPort,flowType],function (tx,results) {
                        this._flows.set(serverIP+serverPort+flowType,flowId);
                        resolve();
                    },function (err) {
                        reject(err);
                    });
                });
            })


        });
    }
}
module.exports = TransferFlowCursor;


