const express = require('express');
const { auth } = require('../../middleware/auth');
const roleGuard = require('../../middleware/roleGuard');
const { createDiscountCode, getAllDiscountCode, getOneDiscountCode, updateDiscountCode, deleteDiscountCode, applyDiscountCode } = require('../../controller/v1/discountCode');

const router = express.Router();

router.route('/').post(auth, roleGuard('ADMIN'), createDiscountCode)
.get(auth, roleGuard('ADMIN'), getAllDiscountCode);

router.route('/:id').get(auth, roleGuard('ADMIN'), getOneDiscountCode)
.patch(auth, roleGuard('ADMIN'), updateDiscountCode)
.delete(auth, roleGuard('ADMIN'), deleteDiscountCode);

router.route('/apply').post(auth, applyDiscountCode);

module.exports = router;