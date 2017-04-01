var charset = require("superagent-charset");
var request = require("superagent");
charset(request);

module.exports =async function(ctx,next) {
    try {
        var {username,urppassword} = ctx.request.body;
        var password=urppassword;
        var valid = await request.post("http://urp.shou.edu.cn/loginAction.do").charset('gbk').type('form').send({
            zjh: username,
            mm: password
        }).then(function(res) {
            if (res.text.indexOf("errorTop") >= 0) {
                return { msg: "账号密码错误", pass: false };
            } else {
                return { pass: true };
            }
        });
        if (valid.pass) {
            var a = {};
            a.username = username;
            a.urpPassword = password;
            a.updateTime = new Date();
            await ctx.db.User.update({ username }, { $set: a }, { upsert: true }).exec();
            ctx.body={
                data:{
                    urpPass:true
                }
            }
        } else {
            ctx.body = {
                err:true,
                data:{
                    urpPass:false
                }
            }
        }
    } catch (err) {
        ctx.logger.error(err);
        await next();
    }
}