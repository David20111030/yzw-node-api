var express = require('express');
var router = express.Router();

import Customer from '../controller/accountController/customerController';
import Address from '../controller/accountController/addressController';

router.post('/login',Customer.Login);
router.post('/getsmscode',Customer.getSmsCode);
router.post('/registe',Customer.Register);
router.post('/backpassword',Customer.backPassword);
router.get('/getuserinfomy',Customer.getUserInfoMy);
router.get('/getuserinfo',Customer.getUserInfo);
router.post('/addaddress',Address.addAddress);
router.post('/deladdress',Address.delAddress);
router.post('/updateaddress',Address.updateAddress);
router.get('/getaddressinfo',Address.getAddressInfo);
router.get('/getaddresslist',Address.getAddressList);

module.exports = router;