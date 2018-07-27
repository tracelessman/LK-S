
const Pool = require('../Store/pool');
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
                    resolve(results[0]);
                }
            });
        });
    }
}
module.exports = Member;
