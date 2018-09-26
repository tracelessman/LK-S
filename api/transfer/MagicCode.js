const Pool = require('../store/pool');
const Log = require('./Log');
let MagicCode = {
    asyGetMagicCode:function () {
        return new Promise((resolve,reject)=>{
            let sql = `
                select * from magicCode where id=1
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
    _newMagicCodeRec:function () {
        return new Promise((resolve,reject)=>{
            let sql = `
                insert into magicCode
                set ?
            `;
            Pool.query(sql,{id:1}, (error,results,fields) =>{
                if(error){
                    reject(error);
                }else{
                    resolve();
                }
            });
        });
    },
    setOrgMagicCode: async function (mCode) {
        let rec = await this.asyGetMagicCode();
        if(!rec){
            await this._newMagicCodeRec();
        }
        return new Promise((resolve,reject)=>{
            let sql = " update magicCode set orgMCode=? where id=1 ";
            Pool.query(sql,[mCode], (error,results,fields) =>{
                if(error){
                    reject(error);
                }else{
                    resolve();
                }
            });
        });
    },
    setMemberMagicCode: async function (mCode) {
        let rec = await this.asyGetMagicCode();
        if(!rec){
            await this._newMagicCodeRec();
        }
        return new Promise((resolve,reject)=>{
            let sql = " update magicCode set memberMCode=? where id=1 ";
            Pool.query(sql,[mCode], (error,results,fields) =>{
                if(error){
                    reject(error);
                }else{
                    resolve();
                }
            });
        });
    }
}
module.exports = MagicCode;

