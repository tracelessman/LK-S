const Pool = require('../Store/pool');
let Log = {

    _addLog:function (uid,action,des,type) {
        Pool.query(`
            insert into log
            set ?`,{uid:uid,action:action,description:des,time:Date.now(),type:type},function (error,results,fields) {});
    },

    bussiness:function (uid,action,des) {
        this._addLog(uid,action,des,2);
    },

    info:function (des,uid,action) {
        console.info(des);
        this._addLog(uid,action,des,0);
    },

    error:function (des,uid,action) {
        console.info(des);
        this._addLog(uid,action,des,1);
    }
};
module.exports = Log;
