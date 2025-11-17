const express = require('express');
const { auth } = require('../../middleware/auth');
const roleGuard = require('../../middleware/roleGuard');
const { multerStorage } = require('../../utils/multerConfigs');

const upload = multerStorage('public/images/category-icons');

const router = express.Router();

router.route('/').post(auth, roleGuard('ADMIN'),upload.single('icon'), createCategory)
.get(getCategory);

module.exports = router;