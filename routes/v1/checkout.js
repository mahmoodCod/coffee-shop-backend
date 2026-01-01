const express = require('express');
const {auth} = require('../../middleware/auth');
const roleGuard = require('../../middleware/roleGuard');
const { createCheckout, verifyCheckout } = require('../../controller/v1/checkout');

const router = express.Router();

router.post('/', auth, createCheckout);

router.get('/:verify', auth, verifyCheckout);
    

module.exports = router;