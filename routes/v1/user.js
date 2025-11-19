const express = require('express');
const { auth } = require('../../middleware/auth');
const { getAll, banUser,changeRole, createAddress, removeAddress, updateAddress } = require('../../controller/v1/user');
const roleGuard = require('../../middleware/roleGuard');

const router = express.Router();

router.route('/').get(auth, getAll);
router.route('/ban/:userId').post(auth,roleGuard('ADMIN'),banUser);
router.route('/role/:id').put(auth, roleGuard('ADMIN'), changeRole);
router.route('/me/addresses').post(auth, createAddress);
router.route('/me/addresses/:addressId').delete(auth,removeAddress).patch(auth, updateAddress);

module.exports = router;