var consts = require('./consts');
var current = require('./current');
var config = require('./config');
var common = require('./common');

var routes = ['/user','/cart','/address','/user','/order','/integral'];
var anonymousRoutes = ['/user/qrcode'];

var authorize = function (req, res, next) {
    
    var auth = false;
    var url = req.originalUrl.indexOf('?') > -1 ? req.originalUrl.substring(0, req.originalUrl.indexOf('?')) : req.originalUrl;
    
    for (var route in anonymousRoutes) {
        if (url == anonymousRoutes[route]) {
            next();
            return;
        }
    }

    for (var index in routes) {
        if (url.indexOf(routes[index]) >= 0) {
            auth = true; break;
        }
    }
    
    if (auth && false == current.auth(req)) {
        if (req.xhr) {
            res.send(consts.error.authorize);
        }
        else {
            res.redirect('/account/logon?returnUrl=' + encodeURIComponent(url));
        }
        
        return;
    }
    
    var user = current.getUser(req);
    if (user != null && user.level == '01') { 
        res.locals.wx_share_url = config.domain + '/user/qrcode?customerid=' + user.id;
        res.locals.wx_share_icon = config.resourceUrl+'/images/sharelogo.png';
        //res.locals.wx_share_title = '【'+ user.nickname+'】在有妆网花98元买到了全年免费领取化妆品资格。';
        //res.locals.wx_share_content = '分享一个网红们都在用的面膜，就在有妆网，真正的高逼格品质好货。';
        res.locals.wx_share_title = '有妆网';
        res.locals.wx_share_content = '分享一个网红们都在用的化妆品平台，就在有妆网，真正的高逼格品质好货。';
    }

    /**
     *  单设置 投票模块的分享信息
     */
    if (url.indexOf('/vote') >= 0) {
        config.pagetitle = '有妆网-亚洲女神';
        res.locals.wx_share_url = config.domain + url;
        res.locals.wx_share_icon = config.resourceUrl+'/images/whoisyazhounvshen.jpg';
        res.locals.wx_share_title = '美若天仙的众女神，是否有哪一位让你为之动容，来来来，为「亚洲女神」评选投上一票!';
        res.locals.wx_share_content = '香港莎莎贸易有限公司主办,3999元化妆品礼包+iphone7等您来领,猛戳~~';
    }
    else {
        config.pagetitle = '有妆网';
    }

    /**
     *  单设置 大转盘模块的分享信息
     */
    if (url.indexOf('/turntable') >= 0) {
        config.pagetitle = '有妆网-免费领用化妆品';
        res.locals.wx_share_url = config.domain + '/turntable';
        res.locals.wx_share_icon = config.resourceUrl+'/images/sharetruntable.jpg';
        res.locals.wx_share_title = '有妆福利,每天等你来拿,小伙伴们快快来领~';
        res.locals.wx_share_content = '有妆福利,每天等你来拿,小伙伴们快快来领~~';
    }
    else {
        config.pagetitle = '有妆网';
    }
    
    next();
};

module.exports = authorize;
