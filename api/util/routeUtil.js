


const routeUtil = {
    checkLogin(req,res){
        if(!req.session.user){
            res.json({
                isExpired:true
            })
            return false
        }else{
            return true
        }
    }
}

Object.freeze(routeUtil)
module.exports = routeUtil
