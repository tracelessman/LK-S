

const Pool = require('../store/pool');
const Log = require('./Log');
let Group = {
    // _asyGetGroupContacts:function (gid) {
    //     return new Promise((resolve,reject)=>{
    //         let sql = `
    //             select member.* from member,groupMember
    //             where groupMember.memberId = member.id
    //             and groupMember.gid=?
    //             and member.orgId is null
    //         `;
    //         Pool.query(sql,[gid], (error,results,fields) =>{
    //             if(error){
    //                 resolve(null);
    //             }else{
    //                 resolve(results);
    //             }
    //         });
    //     });
    // },
    asyGetGroupMemberIds:function (gid) {
        return new Promise((resolve,reject)=>{
            let sql = `
                select memberId from groupMember 
                where groupMember.gid=?
            `;
            Pool.query(sql,[gid], (error,results,fields) =>{
                if(error){
                    resolve(null);
                }else{
                    resolve(results);
                }
            });
        });
    },
    asyGetAllGroups:function (uid) {
        return new Promise((resolve,reject)=>{
            let sql = `
                select groupChat.id,groupChat.name from groupChat,groupMember 
                where groupChat.id = groupMember.gid
                and groupMember.memberId=?
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
    asyGetGroupContacts:function (uid) {
        return new Promise((resolve,reject)=>{
            let sql = `
                select member.* from groupChat,groupMember,member 
                where groupChat.id = groupMember.gid
                and groupMember.memberId=member.id
                and member.orgId is null
                and groupChat.id in (
                    select groupChat.id from groupChat,groupMember 
                    where groupChat.id = groupMember.gid
                    and groupMember.memberId=?
                )
                and member.id not in(
                    select contactId from friend
                    where memberId=?
                )
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
    asyGetAllGroupDetail:async function (uid) {
        let groups = await this.asyGetAllGroups(uid);
        if(groups){
            let ps1 = [];
            groups.forEach((group)=>{
                ps1.push(this.asyGetGroupMemberIds(group.id));
            });
            let result1 = await Promise.all(ps1);
            for(let i=0;i<result1.length;i++){
                groups[i].members = result1[i];
            }
        }
        return groups;
    },
    asyGetGroup:function (id) {
        return new Promise((resolve,reject)=>{
            let sql = `
                select * from groupChat 
                where id=?
            `;
            Pool.query(sql,[id], (error,results,fields) =>{
                if(error){
                    reject();
                }else{
                    resolve(results[0]);
                }
            });
        });
    },
    asyAddGroup:function (id,name) {
        return new Promise((resolve,reject)=>{
            let sql = `
                insert into groupChat
                set ?
            `;
            Pool.query(sql,{id:id,name:name}, (error,results,fields) =>{
                if(error){
                    reject(error);
                }else{
                    resolve();
                }
            });
        });
    },
    asyAddGroupMember:function (gid,contactId) {
        return new Promise((resolve,reject)=>{
            let sql = `
                insert into groupMember
                set ?
            `;
            Pool.query(sql,{gid:gid,memberId:contactId}, (error,results,fields) =>{
                if(error){
                    reject(error);
                }else{
                    resolve();
                }
            });
        });
    },
    asyGetGroupMembers:function (gid) {
        return new Promise((resolve,reject)=>{
            let sql = `
                select member.* from groupMember,member 
                where groupMember.memberId=member.id
                and groupMember.gid=?
            `;
            Pool.query(sql,[gid], (error,results,fields) =>{
                if(error){
                    resolve(null);
                }else{
                    resolve(results);
                }
            });
        });
    },
    setGroupName:function (gid,name) {
        return new Promise((resolve,reject)=>{
            let sql = " update groupChat set name=? where id=? ";
            Pool.query(sql,[name,gid], (error,results,fields) =>{
                if(error){
                    reject(error);
                }else{
                    resolve();
                }
            });
        });
    }
}
module.exports = Group;
