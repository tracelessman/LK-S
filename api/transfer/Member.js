
const Pool = require('../store/pool');
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
    },
    asyGetMembers:function (ids) {
        return new Promise((resolve,reject)=>{
            if(ids&&ids.length>0){
                let sql = "select * from member where id in(";
                for(let i=0;i<ids.length;i++){
                    sql += "?";
                    if(i<ids.length-1){
                        sql+=","
                    }
                }
                sql+=")";
                Pool.query(sql,ids, (error,results,fields) =>{
                    if(error){
                        resolve(null);
                    }else{
                        resolve(results);
                    }
                });

            }
            resolve(null);
        });
    }
}
module.exports = Member;
