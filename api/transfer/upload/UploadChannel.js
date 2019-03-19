const net = require('net');
const fs = require("fs");
const path = require('path');
class UploadChannel{
    constructor(schedular,uploadPath){
        this._schedular = schedular;
        this._uploadPath = uploadPath;
    }

    listen(){
        return new Promise((resolve,reject)=>{
            //TODO 超时无连接访问自动关闭
            const server = net.createServer((c) => {
                let writable = fs.createWriteStream(path.join(__dirname,this._uploadPath));
                writable.on('close',function () {
                    console.info("writeable close")
                });
                writable.on('drain',function () {
                    console.info("writeable drain")
                });
                writable.on('error',function () {
                    console.info("writeable error")
                });
                writable.on('finish',function () {
                    console.info("writeable finish")
                    //TODO notify Schedular
                    this._schedular.finish()
                });
                writable.on('pipe',function () {
                    console.info("writeable pipe")
                });
                writable.on('unpipe',function () {
                    console.info("writeable unpipe")
                });

                c.pipe(writable);

                c.on('end',function () {
                    console.info("c end")
                })


                c.on('error',(err)=>{
                    console.info("c err"+err)
                })

                c.on('close',()=>{
                    console.info("c close")
                })


            });
            server.on('error', (err) => {
                if (err.code === 'EADDRINUSE') {
                    console.log('Address in use, retrying...');
                    setTimeout(() => {
                        server.close();
                        server.listen(() => {
                            console.log('server bound again');

                            resolve(server.address().port)
                        });
                    }, 2000);
                }
            });
            server.on('close',()=>{
                console.log('server close');
            });
            server.listen(() => {
                console.log('server bound');
                resolve(server.address().port)
            });
        })
    }
}


module.exports=UploadChannel

