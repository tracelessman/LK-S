
const Pool = require('../store/pool');
const Log = require('./Log');
let Friend = {
    asyGetAllFriends:function (uid) {
        return new Promise((resolve,reject)=>{
            let sql = `
                select c.* from friend as f,contact as c
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

    asyGetContact:function (uid) {
        return new Promise((resolve,reject)=>{
            let sql = `
                select * from contact
                where id=?
            `;
            Pool.query(sql,[uid], (error,results,fields) =>{
                if(error){
                    reject();
                }else{
                    resolve(results[0]);
                }
            });
        });
    },

    asyAddContact:function (id,name,pic,serverIP,serverPort,mCode) {
        return new Promise((resolve,reject)=>{
            let sql = `
                insert into contact
                set ?
            `;
            Pool.query(sql,{id:id,name:name,pic:pic,serverIP:serverIP,serverPort:serverPort,mCode:mCode}, (error,results,fields) =>{
                if(error){
                    reject(error);
                }else{
                    resolve();
                }
            });
        });
    },

    asyGetFriend:function (uid,contactUid) {
        return new Promise((resolve,reject)=>{
            let sql = `
                select c.* from friend as f,contact as c
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
