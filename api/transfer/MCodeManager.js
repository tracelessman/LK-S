const Org = require('./Org');
let MCodeManager = {

    _asyGetTopMCode:function () {
        return new Promise( (resolve,reject)=> {
            Org.asyGetTopOrg().then( (result) =>{
                if(result){
                    this._topOrgMCode = result.mCode;
                    this._topMemberMCode = result.memberMCode;
                }
                resolve();
            });

        });

    },

    setTopOrgMCode:function (topOrgMCode) {
        this._topOrgMCode = topOrgMCode;
    },

    setTopMemberMCode:function (topMemberMCode) {
        this._topMemberMCode = topMemberMCode;
    },

    asyGetTopMemberMCode:function () {
        return new Promise( (resolve,reject)=> {
            if(this._topMemberMCode){
                resolve(this._topMemberMCode);
            }else{
                this._asyGetTopMCode().then(()=>{
                    resolve(this._topMemberMCode);
                })
            }
        });
    },
    asyGetTopOrgMCode:function () {
        return new Promise( (resolve,reject)=> {
            if(this._topOrgMCode){
                resolve(this._topOrgMCode);
            }else{
                this._asyGetTopMCode().then(()=>{
                    resolve(this._topOrgMCode);
                })
            }
        });
    }
}
module.exports = MCodeManager;
