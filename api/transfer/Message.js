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
    }
}
module.exports = Message;
