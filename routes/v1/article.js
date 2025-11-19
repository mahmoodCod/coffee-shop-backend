const express = require('express');
const { auth } = require('../../middleware/auth');
const roleGuard = require('../../middleware/roleGuard');
const { createArticle, getAllArticles, getOne, deleteArticle, updateArticle, saveDraft } = require('../../controller/v1/article');
const { multerStorage } = require('../../utils/multerConfigs');

const upload = multerStorage('public/images/articles');

const router = express.Router();

router.route('/').get(getAllArticles)
.post(
    auth,roleGuard('ADMIN'),upload.single('cover'), createArticle);

router.route('/href/:href').get(getOne);

router.route('/:id').delete(auth,roleGuard('ADMIN'), deleteArticle)
.patch(
    auth,
    roleGuard('ADMIN'),
    upload.single('cover'),
    updateArticle);

router.route('/:id/draft')
.post(
    auth,roleGuard('ADMIN'),upload.single('cover'),saveDraft);

module.exports = router;