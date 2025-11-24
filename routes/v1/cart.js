const express = require('express');
const { auth } = require('../../middleware/auth');
const { getCart, addCart, removeCart, updateCart, clearCart } = require('../../controller/v1/cart');

const router = express.Router();

router.get('/', auth, getCart);

router.post('/items', auth, addCart);

router.delete('/items', auth, removeCart);

router.put('/items',auth, updateCart);

router.delete('/clear', auth, clearCart);

module.exports = router;