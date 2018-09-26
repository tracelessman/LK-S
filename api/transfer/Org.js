const Pool = require('../store/pool');
const Log = require('./Log');
let org = {
    asyGetTopOrg:function () {
        return new Promise((resolve,reject)=>{
            let sql = `
                select * from org
                where parentId is null
            `;
            Pool.query(sql,[], (error,results,fields) =>{
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
                select * from org order by id
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
    asyGetBaseList:function () {
        return new Promise((resolve,reject)=>{
            let sql = "select id,name,parentId from org";
            Pool.query(sql,[], (error,results,fields) =>{
                if(error){
                    resolve(null);
                }else{
                    resolve(results);
                }
            });
        });
    },
    asyGetOrg:function (orgId) {
        return new Promise((resolve,reject)=>{
            let sql = "select * from org where id=?";
            Pool.query(sql,[orgId], (error,results,fields) =>{
                if(error){
                    resolve(null);
                }else{
                    resolve(results[0]);
                }
            });
        });
    },
    setMCode:function (id,mCode) {
        return new Promise((resolve,reject)=>{
            let sql = " update org set mCode=? where id=? ";
            Pool.query(sql,[mCode,id], (error,results,fields) =>{
                if(error){
                    reject(error);
                }else{
                    resolve();
                }
            });
        });
    }
}
module.exports = org;
