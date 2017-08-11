var uuid = require('node-uuid');
var crypto = require('crypto');
var request = require('request');
import config from 'config-lite';

let common = {

    randomName() {
        try {
            let firstname = ["李", "西门", "沈", "张", "上官", "司徒", "欧阳", "轩辕"];
            let nameq = ["彪", "巨昆", "锐", "翠花", "小小", "撒撒", "熊大", "宝强"];
            return firstname[Math.floor(Math.random() * (firstname.length))] + nameq[Math.floor(Math.random() * (nameq.length))];
        } catch (error) {
            return '...';
        }
    },
    GUID() {
        return uuid.v1().replace(/-/g, '');//基于时间戳生成uuid
        //uuid.v4();//随机生成uuid
    },
    md5(text) {//md5 大写
        try {
            var md5Crypto = crypto.createHash('md5');
            md5Crypto.update(text);
            return md5Crypto.digest('hex').toUpperCase();
        }
        catch (e) {
            return '';
        }
    },
    orderCode() {
        //生成订单编号
        let timerchuo = new Date();;
        return Math.floor(Math.random() * 1000).toString() + timerchuo.getFullYear().toString() + timerchuo.getMonth().toString() + timerchuo.getDay().toString() + timerchuo.getHours().toString() + timerchuo.getMinutes().toString() + timerchuo.getSeconds().toString() + Math.floor(Math.random() * 1000).toString();
    },
    skipNumber(pageindex) {//mongo分页 计算skip的值
        if (pageindex <= 0) { pageindex = 1; }
        return (pageindex - 1) * config.pageDocument;
    },
    ISO_Time(dateTime) {//ISO 时间转换为 北京时间
        return new Date(+new Date(dateTime) + 8 * 3600 * 1000).toISOString().replace(/T/g, ' ').replace(/\.[\d]{3}Z/, '');
    }

}

export default common;