const Pool = require('../Store/pool');
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
                }else{
                    resolve(results[0]);
                }
            });
        });
    }
}
module.exports = org;
