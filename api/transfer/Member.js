
const Pool = require('../Store/pool');
const Log = require('./Log');
let Member = {
    asyGetMember:function (uid) {
        return new Promise((resolve,reject)=>{
            let sql = `
                select * from member
                where id=?
            `;
            Pool.query(sql,[uid], (error,results,fields) =>{
                if(error){
                    resolve(null);
                }else if(results.length==0){
                    resolve(null);
                }else{
                    resolve(results[0]);
                }
            });
        });
    },
    asyGetAll:function () {
        return new Promise((resolve,reject)=>{
            let sql = `
                select * from member
            `;
            Pool.query(sql,[], (error,results,fields) =>{
                if(error){
                    resolve(null);
                }else{
                    resolve(results);
                }
            });
        });
    },
    asyGetAllMCodes:function () {
        return new Promise((resolve,reject)=>{
            let sql = `
                select id,mCode from member
            `;
            Pool.query(sql,[], (error,results,fields) =>{
                if(error){
                    resolve(null);
                }else{
                    resolve(results);
                }
            });
        });
    }
}
module.exports = Member;
