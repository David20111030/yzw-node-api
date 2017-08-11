var express = require('express');
var router = express.Router();
import Cart from '../controller/orderController/cartController';
import Order from '../controller/orderController/orderController';


router.post('/addcart', Cart.addCart);
router.post('/selectedcart', Cart.selectedCart);
router.post('/delcart', Cart.delCart);
router.get('/cartlist', Cart.cartList);

router.post('/getordercofim', Order.getOrderCofim);
router.post('/setorder', Order.setOrder);
router.post('/getorderlist',Order.getOrderList);
router.post('/getorderinfo',Order.getOrderInfo);


module.exports = router;
