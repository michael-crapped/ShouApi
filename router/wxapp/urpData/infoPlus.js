var s2u = require('../lib/session2userInfo');
module.exports = async function(ctx, next) {
    try {
        var { thirdSession, type } = ctx.query;
        var { username, urppassword } = await s2u(thirdSession);
        if (username) {
            return require("../../urpData/lib/infoPlusCore")(ctx, next, username, urppassword, type);
        } else {
            ctx.body = {
                data:{
                    pass:false
                }
            }
        }
    } catch (error) {
        console.error(error);
        await next();
    }
}