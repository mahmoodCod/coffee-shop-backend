const express = require('express');
const {auth} = require('../../middleware/auth');
const roleGuard = require('../../middleware/roleGuard');
const { createCheckout, getAllCheckouts, getCheckout, updateCheckout, removeCheckout } = require('../../controller/v1/checkout');

const router = express.Router();

router.route('/')
    .post(auth, createCheckout)
    .get(auth, roleGuard('ADMIN'), getAllCheckouts);

router.route('/:checkoutId')
    .get(auth, getCheckout)
    .patch(auth, updateCheckout)
    .delete(auth, roleGuard('ADMIN'), removeCheckout);

module.exports = router;