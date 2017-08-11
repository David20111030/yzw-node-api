var express = require('express');
var router = express.Router();

import Product from '../controller/productController/productController';

router.get('/productinfo',Product.getProductInfo);
router.get('/productattr',Product.getProductAttr);
router.get('/getproductlist',Product.getProductList);
router.get('/getproductnewlist',Product.getProductNewList);

module.exports = router;