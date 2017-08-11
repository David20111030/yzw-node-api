var express = require('express');
var router = express.Router();
import Customer from '../controller/accountController/customerController';


router.get('/setintegral', Customer.setIntegral);
router.get('/consumeintegral', Customer.consumeIntegral);


module.exports = router;
