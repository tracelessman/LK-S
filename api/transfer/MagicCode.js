const Pool = require('../Store/pool');
const Log = require('./Log');
let MagicCode = {
    asyGetMagicCode:function () {
        return new Promise((resolve,reject)=>{
            let sql = `
                select * from magicCode
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
    }
}
module.exports = MagicCode;

