var express = require('express');
var router = express.Router();
import Indexs from '../controller/indexController/index';

/**
 * 获取首页Banner
 */
router.get('/getbanner', Indexs.getBanner);
router.get('/getproductlist', Indexs.getIndexProductList);


module.exports = router;
