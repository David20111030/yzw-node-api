var express = require('express');
var router = express.Router();

import Common from '../controller/commonController/commonController';

router.get('/getsysaddressdata',Common.getSysAddressData);
router.post('/getexpresslistinfo',Common.getExpressListInfo);

module.exports = router;