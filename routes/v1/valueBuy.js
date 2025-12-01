const express = require('express');
const { auth } = require('../../middleware/auth');
const roleGuard = require('../../middleware/roleGuard');
const { createValueBuy, getAllValueBuy, getOneValueBuy, updateValueBuy, deleteValueBuy } = require('../../controller/v1/valueBuy');

const router = express.Router();

// router.route('/')
//     .post(auth, roleGuard('ADMIN'), createValueBuy)
//     .get(getAllValueBuy);

// router.route('/:id')
//     .get(getOneValueBuy)
//     .patch(auth, roleGuard('ADMIN'), updateValueBuy)
//     .delete(auth, roleGuard('ADMIN'), deleteValueBuy);

router.route('/')
    .post( createValueBuy)
    .get(getAllValueBuy);

router.route('/:id')
    .get(getOneValueBuy)
    .patch( updateValueBuy)
    .delete( deleteValueBuy);

module.exports = router;