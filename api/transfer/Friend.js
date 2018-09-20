
const Pool = require('../store/pool');
const Log = require('./Log');
let Friend = {
    asyGetAllFriends:function (uid) {
        return new Promise((resolve,reject)=>{
            let sql = `
                select c.* from friend as f,member as c
                where f.contactId = c.id
                and f.memberId=?
            `;
            Pool.query(sql,[uid], (error,results,fields) =>{
                if(error){
                    resolve(null);
                }else{
                    resolve(results);
                }
            });
        });
    },



    asyGetFriend:function (uid,contactUid) {
        return new Promise((resolve,reject)=>{
            let sql = `
                select c.* from friend as f,member as c
                where f.contactId = c.id
                and f.memberId=?
                and c.id = ?
            `;
            Pool.query(sql,[uid,contactUid], (error,results,fields) =>{
                if(error){
                    resolve(null);
                }else{
                    resolve(results[0]);
                }
            });
        });
    },
    asyAddFriend:function (uid,contactId) {
        return new Promise((resolve,reject)=>{
            let sql = `
                insert into friend
                set ?
            `;
            Pool.query(sql,{memberId:uid,contactId:contactId}, (error,results,fields) =>{
                if(error){
                    reject(error);
                }else{
                    resolve();
                }
            });
        });
    }
}
module.exports = Friend;
