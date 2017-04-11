var s2u = require('./lib/session2userInfo');
module.exports = async function(ctx, next) {
    try {
        var { thirdSession, type } = ctx.query;
        var { username, urppassword } = await session2username(thirdSession);
        if (username) {
            return require("../urpData/lib/curriCore")(ctx, next, username, urppassword, type);
        } else {
            ctx.body = {
                data:{
                    pass:false
                }
            }
        }
    } catch (error) {
        await next();
    }
}