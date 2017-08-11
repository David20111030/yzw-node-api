var consts = require('./consts');

////生成环境
var config = {
   consts: consts,
   siteName: '有妆网触屏版',
   platform: '00',
   apiVersion: '1.0',
   domain: 'http://m.iyouzhuang.com',
   apiUrl: 'http://101.201.143.220:8091/api/wap',
   resourceUrl: 'http://s.iyouzhuang.com',
   resourcesion: '1.81',
   telphone: '400-102-4198',
   appsecret: 'youzhuan',
   wx:{
       appId: 'wx3d405f50df3df36f',
       appSecret: '15afdcd6f7dd0b5fc71a23df0a8a593d'
   },
   mainprourl: '/product?id=1',
   pagetitle: '有妆网'
};

//测试环境
// var config = {
//     consts: consts,
//     siteName: '有妆网触屏版',
//     platform: '00',
//     apiVersion: '1.0',
//     domain: 'http://m.guoerhong.com',
//     apiUrl: 'http://182.92.117.254:8091/api/wap',
//     resourceUrl: 'http://s.guoerhong.com',
//     resourcesion: '1.81',
//     telphone: '400-102-4198',
//     appsecret: 'youzhuan',
//     wx: {
//         appId: 'wx497019ecfb1b6a7a',
//         appSecret: '469b9ab44d7b18fdcd838dc5669dd696'
//     },
//     mainprourl: '/product?id=1',
//     pagetitle: '有妆网'
// };

module.exports = config;
