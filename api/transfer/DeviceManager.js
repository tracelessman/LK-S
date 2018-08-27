const Device = require('./Device');
let DeviceManager={
    _devices:{},
    asyGetDevices: async function (uid) {
        let devices = this._devices[uid];
        if(!devices){
            devices = await Device.asyGetDevices(uid);
            this._devices[uid]=devices;
        }
        return devices;
    },
    deviceChanged:function (uid) {
        delete this._devices[uid];
    }
};
module.exports = DeviceManager;