const express = require('express');
const { auth } = require('../../middleware/auth');
const roleGuard = require('../../middleware/roleGuard');
const { multerStorage } = require('../../utils/multerConfigs');

const upload = multerStorage('public/images/category-icons');

const router = express.Router();

router.route('/').post(auth, roleGuard('ADMIN'),upload.single('icon'), createCategory)
.get(getCategory);

router.route('/categoryId').post(auth, roleGuard('ADMIN'), upload.single('icon'), updateCategory)
.delete(auth, roleGuard('ADMIN'), removeCategory);
module.exports = router;