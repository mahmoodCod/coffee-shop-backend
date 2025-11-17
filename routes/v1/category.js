const express = require('express');
const { auth } = require('../../middleware/auth');
const roleGuard = require('../../middleware/roleGuard');
const { multerStorage } = require('../../utils/multerConfigs');
const { createCategory,getCategory, getCategoryTree, getFeaturedCategories, getRootCategories, updateCategory, removeCategory, 
        getSubcategories, updateCategoryOrder, updateCategoryStatus} = require('../../controller/v1/category');

const upload = multerStorage('public/images/category-images');

// Middleware to handle optional file upload
const optionalUpload = (req, res, next) => {
    upload.single('images')(req, res, (err) => {
        if (err && err.code !== 'LIMIT_UNEXPECTED_FILE') {
            return next(err);
        }
        next();
    });
};

const router = express.Router();

router.route('/')
    .get(auth, roleGuard('ADMIN'), getCategory)
    .post(auth, roleGuard('ADMIN'), optionalUpload, createCategory);

router.route('/tree').get(getCategoryTree);

router.route('/featured').get(getFeaturedCategories);

router.route('/root').get(getRootCategories);

router.route('/:categoryId')
    .put(auth, roleGuard('ADMIN'), optionalUpload, updateCategory)
    .delete(auth, roleGuard('ADMIN'), removeCategory);

router.route('/:categoryId/subcategories').get(getSubcategories);

router.route('/:categoryId/status').put(auth, roleGuard('ADMIN'), updateCategoryStatus);

router.route('/:categoryId/order').put(auth, roleGuard('ADMIN'), updateCategoryOrder);

module.exports = router;