const express = require('express');
const { auth } = require('../../middleware/auth');
const roleGuard = require('../../middleware/roleGuard');
const { multerStorage } = require('../../utils/multerConfigs');
const { createProduct, getAllProduct, getOneProduct, updateProduct, deleteProduct } = require('../../controller/v1/product');

const upload = multerStorage('public/images/products');

const router = express.Router();

// router.route('/')
// .post(auth, roleGuard('ADMIN'),upload.array('images', 10), createProduct)
// .get(getAllProduct);

// router.route('/:productId')
// .get(getOneProduct)
// .patch(auth,roleGuard('ADMIN'),upload.array('images', 10),updateProduct)
// .delete(auth, roleGuard('ADMIN'), deleteProduct);

router.route('/')
.post(upload.array('images', 10), createProduct)
.get(getAllProduct);

router.route('/:productId')
.get(getOneProduct)
.patch(upload.array('images', 10),updateProduct)
.delete( deleteProduct);
module.exports = router;