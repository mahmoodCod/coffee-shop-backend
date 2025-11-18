const express = require('express');
const { auth } = require('../../middleware/auth');
const roleGuard = require('../../middleware/roleGuard');

const upload = multerStorage('public/images/products');

const router = express.Router();

router.route('/')
.post(auth, roleGuard('ADMIN'),upload.array('images', 10), createProduct)
.get(getAllProduct);

router.route('/:productId')
.get(getOneProduct)
.patch(auth,roleGuard('ADMIN'),upload.array('images', 10),updateProduct)
.delete(auth, roleGuard('ADMIN'), deleteProduct);

module.exports = router;