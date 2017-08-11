var request = require('request');
var crypto = require('crypto');
var uuid = require('node-uuid');
var consts = require('./consts');
var config = require('./config');
var des = require('./des');
var logger = require('./loghelper');

var getData = function (parameters) {
    request({
        url: parameters.url + '?data=' + parameters.data,
        method: 'GET',
        json: true
    }, function (error, response, data) {
        if (!error && response.statusCode == 200) {
            parameters.callback(data);
        }
        else {
            parameters.callback(config.consts.error.request);
        }
    });
};
var get = function (parameters) {
    request({
        url: parameters.url,
        method: 'GET',
        json: true,
        body: getPackage(parameters.data)
    }, function (error, response, data) {
        if (!error && response.statusCode == 200) {
            parameters.callback(data);
        }
        else {
            parameters.callback(config.consts.error.request);
        }
    });
};

var postData = function (parameters) {
    request({
        url: parameters.url,
        method: 'POST',
        json: true,
        body: { data: parameters.data }
    }, function (error, response, data) {
        if (!error && response.statusCode == 200) {
            parameters.callback(data);
        }
        else {
            parameters.callback(config.consts.error.request);
        }
    });
};
var post = function (parameters) {
    request({
        url: parameters.url,
        method: 'POST',
        json: true,
        body: getPackage(parameters.data)
    }, function (error, response, data) {
        if (!error && response.statusCode == 200) {
            parameters.callback(data);
        }
        else {
            parameters.callback(config.consts.error.request);
        }
    });
};

var getPackage = function (data) {
    var params = {
        data: data,
        noncestr: uuid.v4().replace(new RegExp(/(-)/g), ''),
        timestamp: Math.round(new Date().getTime() / 1000),
        version: config.apiVersion
    };
    
    var str = '';
    if (typeof (data) != 'undefined') {
        str += 'data=' + params.data + '&';
    }
    str += 'noncestr=' + params.noncestr + '&timestamp=' + params.timestamp + '&version=' + params.version;
    
    var desStr = des.encrypt(str).toUpperCase();
    var md5Str = md5(desStr).toUpperCase();
    params.signature = md5Str;
    return params;
};

var md5 = function (text) {
    try {
        var md5Crypto = crypto.createHash('md5');
        md5Crypto.update(text);
        return md5Crypto.digest('hex').toUpperCase();
    } 
    catch (e) {
        return '';
    }
};

var getOpenIdAndAccessToken = function (req, res, callback) {
    try {
        if (req.query.code) {
            var url = 'https://api.weixin.qq.com/sns/oauth2/access_token?appid=' + config.wx.appId + '&secret=' + config.wx.appSecret + '&code=' + req.query.code + '&grant_type=authorization_code';
            request({
                url: url,
                method: 'POST',
                json: true,
                body: null
            }, function (error, response, data) {
                if (!error && response.statusCode == 200) {
                    callback(data);
                }
                else {
                    callback();
                }
            });
        }
        else {
            var absUrl = encodeURIComponent('http://' + req.headers.host + req.baseUrl + req.url);
            var url = 'https://open.weixin.qq.com/connect/oauth2/authorize?appid=' + config.wx.appId + '&redirect_uri=' + absUrl + '&response_type=code&scope=snsapi_base&state=STATE#wechat_redirect';
            res.redirect(url);
        }
    } 
    catch (e) {
        callback();
    }
}

var getUserInfo = function (parameters) {
    try {
        var url = 'https://api.weixin.qq.com/cgi-bin/user/info?access_token=' + parameters.token + '&openid=' + parameters.openid + '&lang=zh_CN';
        request({
            url: url,
            method: 'POST',
            json: true,
            body: null
        }, function (error, response, data) {
            if (!error && response.statusCode == 200) {
                parameters.callback(data);
            }
            else {
                parameters.callback();
            }
        });
    } 
    catch (e) {
        parameters.callback();
    }
}


/**
 * 显示授权后 获取用户信息
 */
var getSnsUserInfo = function (parameters) {
    try {
        var url = 'https://api.weixin.qq.com/sns/userinfo?access_token=' + parameters.token + '&openid=' + parameters.openid + '&lang=zh_CN';
        request({
            url: url,
            method: 'GET',
            json: true,
            body: null
        }, function (error, response, data) {
            if (!error && response.statusCode == 200) {
                parameters.callback(data);
            }
            else {
                parameters.callback(data);
            }
        });
    }
    catch (e) {
        parameters.callback();
    }
}


/**
 * 显示授权
 */
function getSnsOpenIdAndAccessToken(req, res, callback) {
    if (req.query.code!='' && typeof(req.query.code) != "undefined") {
        var url = 'https://api.weixin.qq.com/sns/oauth2/access_token?appid=' + config.wx.appId + '&secret=' + config.wx.appSecret + '&code=' + req.query.code + '&grant_type=authorization_code';
        request({
            url: url,
            method: 'POST',
            json: true,
            body: null
        }, function (error, response, data) {
            callback(data);
        });
    }
    else {
        var absUrl = encodeURIComponent('http://' + req.headers.host + req.baseUrl + req.url);
        var url = 'https://open.weixin.qq.com/connect/oauth2/authorize?appid=' + config.wx.appId + '&redirect_uri=' + absUrl + '&response_type=code&scope=snsapi_userinfo&state=STATE#wechat_redirect '
        res.redirect(url);
    }
}

function isWeixn(req) {
    var ua = req.headers["user-agent"].toLowerCase();
    return ua.match(/MicroMessenger/i) == "micromessenger";
}

module.exports.get = get;
module.exports.post = post;
module.exports.getData = getData;
module.exports.postData = postData;

module.exports.md5 = md5;
module.exports.logger = logger;
module.exports.desEncrypt = des.encrypt;
module.exports.desDecrypt = des.decrypt;

module.exports.getUserInfo = getUserInfo;
module.exports.getOpenIdAndAccessToken = getOpenIdAndAccessToken;
module.exports.isWeixn = isWeixn;

module.exports.getSnsUserInfo = getSnsUserInfo;
module.exports.getSnsOpenIdAndAccessToken = getSnsOpenIdAndAccessToken;
