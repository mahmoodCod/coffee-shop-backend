const express = require('express');
const multer = require('multer');
const { auth } = require('../../middleware/auth');
const roleGuard = require('../../middleware/roleGuard');

const router = express.Router();

router.route('/').get(getAllArticles)
.post(
    multer({storage:multerStorage, limits: { fileSize: 1000000000 } })
    .single('cover'),
    auth,roleGuard('ADMIN'), createArticle);

router.route('/href/:href').get(getOne);

router.route('/:id').delete(auth,roleGuard('ADMIN'), deleteArticle);

router.route('/:id/draft')
.post(
    multer({storage:multerStorage, limits: { fileSize: 1000000000 } })
    .single('cover'),
    auth,roleGuard('ADMIN'),saveDraft);

module.exports = router;