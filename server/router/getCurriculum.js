var cheerio = require("cheerio");

var get = function(username, urpPassword) {
    var url = "http://urp.shou.edu.cn/xkAction.do?actionType=6";
    return require("./../lib/getUrpCore")(url, { username, password: urpPassword }).then(function(res) {
        var $ = cheerio.load(res, { normalizeWhitespace: true });
        var templist = [];
        $("table tr").each(function(i) {
            if (i < 20 && i > 5) {
                var t2 = [];
                $(this).children("td").each(function(j) {
                    var tmp = $(this).text();
                    if (j > 0) {
                        t2.push(tmp.trim());
                    }
                })
                templist.push(t2);
            }
        });
        templist.splice(4, 1);
        templist.splice(8, 1);
        templist[0].splice(0, 1);
        templist[4].splice(0, 1);
        templist[8].splice(0, 1);
        var arr = [];
        for (let i = 0; i < 7; i++) {
            var col = [];
            for (let j = 0; j < 12; j++) {
                col.push(templist[j][i])
            }
            arr.push(col);
        }
        return arr;
    })
}

module.exports = function*(next) {
    try {
        var username = this.params.username;
        var type = this.params.type;
        var _this = this;
        if (type == "cache") {
            var data = yield this.db.Curr.findOne({ username: username }).exec().then(function(value) {
                if (value) {
                    return value.classData
                } else {
                    return require("./login/getInfo")(username).then(function(info) {
                        return get(info.username, info.urpPassword).then(function(classData) {
                            var d = {
                                username,
                                classData
                            }
                            _this.db.Curr.update({ username: username }, { $set: d }, { upsert: true }).exec();
                            return classData;
                        });
                    });
                }
            });
        } else if (type == "fresh") {
            var info = yield require("./login/getInfo")(username);
            var data = yield get(info.username, info.urpPassword);
            var d = {
                username,
                classData: data
            }
            _this.db.Curr.update({ username: username }, { $set: d }, { upsert: true }).exec();
        } else {
            yield next;
        }
        this.body = {
            err: false,
            data: data
        }
    } catch (error) {
        this.logger.error(error);
        yield next;
    }
}