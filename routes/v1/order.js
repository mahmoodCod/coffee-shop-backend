const express = require('express');
const { auth } = require('../../middleware/auth');
const roleGuard = require('../../middleware/roleGuard');
const { getAllOrders, updateOrder } = require('../../controller/v1/order');

const router = express.Router();

router.route("/").get(getAllOrders);
router.route("/:id").patch(auth, roleGuard('ADMIN'), updateOrder);

module.exports = router;