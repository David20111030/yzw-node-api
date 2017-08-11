/**
 * Created by zanxiaopeng on 17/1/11.
 */
var DBHelper = require('./DBHelper');
var config = require('./config');

/*
*插入日志
*/
var info = function (message) {
    if (!message) {
        return;
    }
    var data = [{ platform: config.platform, category: 'error', message: message, exception: '', ip: '', created: new Date() }];
    DBHelper.MongoInsert('systemlog', data, function (req) {
        
    });
};
var error = function (message, exception) {
    if (!message || !exception) {
        return;
    }
    exception = exception || '';
    var data = [{ platform: config.platform, category: 'error', message: message, exception: { message: exception.message, stack: exception.stack }, ip: '', created: new Date() }];
    DBHelper.MongoInsert('systemlog', data, function (req) {
    });
};

module.exports.info = info;
module.exports.error = error;