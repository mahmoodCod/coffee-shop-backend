const express = require('express');
const { auth } = require('../../middleware/auth');
const roleGuard = require('../../middleware/roleGuard');
const { multerStorage } = require('../../utils/multerConfigs');
const { createCategory, getCategoryTree, getFeaturedCategories, getRootCategories, getCategoryById, updateCategory, removeCategory, 
        getSubcategories, updateCategoryOrder, updateCategoryStatus} = require('../../controller/v1/category');

const upload = multerStorage('public/images/category-icons');

const router = express.Router();

router.route('/')
    .get(getCategory)
    .post(auth, roleGuard('ADMIN'), upload.single('icon'), createCategory);

router.route('/tree').get(getCategoryTree);

router.route('/featured').get(getFeaturedCategories);

router.route('/root').get(getRootCategories);

router.route('/:categoryId')
    .get(getCategoryById)
    .put(auth, roleGuard('ADMIN'), upload.single('icon'), updateCategory)
    .delete(auth, roleGuard('ADMIN'), removeCategory);

router.route('/:categoryId/subcategories').get(getSubcategories);

router.route('/:categoryId/status').put(auth, roleGuard('ADMIN'), updateCategoryStatus);

router.route('/:categoryId/order').put(auth, roleGuard('ADMIN'), updateCategoryOrder);

module.exports = router;