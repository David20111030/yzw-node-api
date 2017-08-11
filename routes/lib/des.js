var crypto = require('crypto');
var config = require('./config');

var encrypt = function (plaintext) {
    try {
        var key = new Buffer(config.appsecret);
        var iv = new Buffer(config.appsecret);
        var cipher = crypto.createCipheriv('des', key, iv);
        cipher.setAutoPadding(true) //default true
        var ciph = cipher.update(plaintext, 'utf8', 'base64');
        ciph += cipher.final('base64');
        
        return encodeURIComponent(ciph);
    } 
    catch (e) {
        return '';
    }
};

var decrypt = function (encrypt_text) {
    try {
        encrypt_text = decodeURIComponent(encrypt_text);
        var key = new Buffer(config.appsecret);
        var iv = new Buffer(config.appsecret);
        var decipher = crypto.createDecipheriv('des', key, iv);
        decipher.setAutoPadding(true);
        var txt = decipher.update(encrypt_text, 'base64', 'utf8');
        txt += decipher.final('utf8');
        
        return txt;
    } 
    catch (e) {
        return '';
    }
};

module.exports.encrypt = encrypt;
module.exports.decrypt = decrypt;
