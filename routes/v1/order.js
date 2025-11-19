const express = require('express');
const { auth } = require('../../middleware/auth');
const roleGuard = require('../../middleware/roleGuard');
const { getMyOrders, updateOrder, getAllOrders, createOrder, getOrderById } = require('../../controller/v1/order');

const router = express.Router();

router.route("/")
.post(auth, createOrder)
.get(getMyOrders);

router.route("/:id")
.get(auth, getOrderById);

router.route("/admin/all")
.get(auth, roleGuard('ADMIN'), getAllOrders);

router.route("/admin/:id").patch(auth, roleGuard('ADMIN'), updateOrder);

module.exports = router;