const express = require('express');
const { auth } = require('../../middleware/auth');
const roleGuard = require('../../middleware/roleGuard');
const { multerStorage } = require('../../utils/multerConfigs');
const { createArticle, getAllArticles, getOne, deleteArticle, updateArticle, saveDraft } = require('../../controller/v1/article');

const upload = multerStorage('public/images/articles');

const router = express.Router();

router.route('/').get(getAllArticles)
.post(
    upload.single('cover'),
    auth,roleGuard('ADMIN'), createArticle);

router.route('/href/:href').get(getOne);

router.route('/:id').delete(auth,roleGuard('ADMIN'), deleteArticle)
.patch(
    upload.single('cover'),
    auth,
    roleGuard('ADMIN'),
    updateArticle);

router.route('/:id/draft')
.post(
    upload.single('cover'),
    auth,roleGuard('ADMIN'),saveDraft);

module.exports = router;