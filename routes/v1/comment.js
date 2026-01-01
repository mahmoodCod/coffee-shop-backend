const express = require('express');
const { auth } = require('../../middleware/auth');
const roleGuard = require('../../middleware/roleGuard');
const { createComment, getComment, getAllComments, removeComment, updateComment, createReply, updateReply, removeReply } = require('../../controller/v1/comment');

const router  = express.Router();

router.route('/')
.post(auth, createComment)
.get(getComment);

router.route('/all').get(getAllComments);

router.route('/:commentId')
.delete(auth, roleGuard('ADMIN'), removeComment)
.patch(auth,updateComment);

router.route('/:commentId/reply')
.post(auth,roleGuard('ADMIN'), createReply);

router.route('/:commentId/reply/:replyId')
.patch(auth,roleGuard('ADMIN'), updateReply)
.delete(auth,roleGuard('ADMIN'), removeReply);

module.exports = router;