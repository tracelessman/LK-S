const MagicCode = require('./MagicCode');
let MCodeManager = {

    _asyGetMagicCode:function () {
        return new Promise( (resolve,reject)=> {
            MagicCode.asyGetMagicCode().then( (result) =>{
                if(result){
                    this._orgMCode = result.orgMCode;
                    this._memberMCode = result.memberMCode;
                }
                resolve();
            });

        });

    },

    setOrgMagicCode:function (topOrgMCode) {
        this._orgMCode = topOrgMCode;
    },

    setMemberMagicCode:function (topMemberMCode) {
        this._memberMCode = topMemberMCode;
    },

    asyGetMemberMagicCode:function () {
        return new Promise( (resolve,reject)=> {
            if(this._memberMCode){
                resolve(this._memberMCode);
            }else{
                this._asyGetMagicCode().then(()=>{
                    resolve(this._memberMCode);
                })
            }
        });
    },
    asyGetOrgMagicCode:function () {
        return new Promise( (resolve,reject)=> {
            if(this._orgMCode){
                resolve(this._orgMCode);
            }else{
                this._asyGetMagicCode().then(()=>{
                    resolve(this._orgMCode);
                })
            }
        });
    }
}
module.exports = MCodeManager;
