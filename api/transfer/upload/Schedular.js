const UploadChannel = require("./UploadChannel");
class Schedular{
    constructor(){

    }

    applyChannel(uploadPath){
        //TODO 需要规定一个固定目录
        let baseDir = "/";
        return new UploadChannel(this,baseDir+uploadPath).listen();
    }
}
module.exports=new Schedular()



