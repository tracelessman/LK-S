


const routeUtil = {
    checkLogin(req,res){
        if(!req.session.user){
            res.json({
                isExpired:true
            })
        }
    }
}

Object.freeze(routeUtil)
module.exports = routeUtil
