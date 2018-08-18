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
                select * from org
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
    }
}
module.exports = org;
